import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { NotificationService } from "@/services/notificationService";
import type { ApiNotification } from "@/types/api";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  BellOff,
  Trash2,
  CheckCheck,
  MoreHorizontal,
  MailOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const limit = 20;

  const { fetchUnreadCount } = useNotificationStore();

  // Reset when filter changes
  useEffect(() => {
    setPage(1);
    setNotifications([]);
    setHasMore(true);
  }, [filter]);

  // Load notifications
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await NotificationService.getNotifications({
          page,
          limit,
          unreadOnly: filter === "unread",
        });

        if (cancelled) return;

        const items = res.data || [];
        setNotifications((prev) => (page === 1 ? items : [...prev, ...items]));
        setHasMore(Boolean(res.pagination?.hasMore));
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : "Failed to load notifications";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  // Handlers ------------------------------------------------

  const handleLoadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  const handleFilterChange = (tab: FilterTab) => {
    setFilter(tab);
  };

  const handleMarkAsRead = async (notification: ApiNotification) => {
    if (notification.isRead) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );

      const res = await NotificationService.markAsRead(notification.id);
      if (!res.success) throw new Error(res.message);

      await fetchUnreadCount();
    } catch (e) {
      // Revert on error could go here, or just toast
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (notification: ApiNotification) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      const res = await NotificationService.deleteNotification(notification.id);
      if (!res.success) throw new Error(res.message);

      await fetchUnreadCount();
      toast.success("Notification deleted");
    } catch (e) {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    // Implementation needed
  };

  const handleClearRead = async () => {
    // Implementation needed
  };

  const unreadLocalCount = notifications.filter((n) => !n.isRead).length;

  const handleNavigate = (notification: ApiNotification) => {
    // Only navigate if clicking the body, not the actions
    const { contentType, contentId, type, actor } = notification;
    let target: string | null = null;

    if (contentType === "post" && contentId) target = `/app/posts/${contentId}`;
    else if (contentType === "story" && contentId)
      target = `/app/stories/${contentId}`;
    else if (contentType === "poll" && contentId)
      target = `/app/polls/${contentId}`;
    else if (
      contentType &&
      ["chat", "conversation"].includes(contentType) &&
      contentId
    )
      target = `/app/chat/${contentId}`;
    else if (type === "chat_mention")
      target = contentId ? `/app/chat/${contentId}` : "/app/chat";
    else if (type === "follow" && actor?.username)
      target = `/app/profile/${actor.username}`;

    if (target) {
      if (!notification.isRead) handleMarkAsRead(notification);
      navigate(target);
    }
  };

  // UI ------------------------------------------------------

  return (
    <ComponentErrorBoundary componentName="NotificationsPage">
      <div className="container max-w-2xl mx-auto px-0 sm:px-4 py-4 sm:py-6">
        <Card className="shadow-sm border-border/70 overflow-hidden">
          {/* Header */}
          <CardHeader className="sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b px-4 py-3">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    Notifications
                  </CardTitle>
                </div>

                {/* Mobile-friendly Options Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => void handleMarkAllAsRead()}>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark all read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void handleClearRead()}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                {(["all", "unread"] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleFilterChange(tab)}
                    className={cn(
                      "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                      filter === tab
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                    {tab === "all" ? "All" : "Unread"}
                    {tab === "unread" && unreadLocalCount > 0 && (
                      <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                        {unreadLocalCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0">
            {/* Skeleton loading */}
            {initialLoading && (
              <div className="divide-y divide-border/40">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 animate-pulse">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !initialLoading && (
              <div className="p-8 text-center">
                <p className="text-sm text-destructive font-medium mb-2">
                  Something went wrong
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            )}

            {/* Empty */}
            {!initialLoading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No notifications yet
                </h3>
                <p className="text-sm">
                  When you get notifications, they'll show up here.
                </p>
              </div>
            )}

            {/* Notifications list */}
            <div className="divide-y divide-border/40">
              {notifications.map((n) => {
                const displayName =
                  n.actor?.displayName || n.actor?.username || "Someone";
                const avatarInitial = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNavigate(n)}
                    className={cn(
                      "group relative flex gap-4 p-4 transition-all duration-200 cursor-pointer",
                      // Unread vs Read styling
                      !n.isRead
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "bg-background hover:bg-muted/40"
                    )}>
                    {/* Unread Indicator Dot */}
                    {!n.isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0 border border-border/50">
                      {n.actor?.profileImage ? (
                        <AvatarImage src={n.actor.profileImage} />
                      ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {avatarInitial}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm leading-snug">
                          <span className="font-semibold text-foreground mr-1">
                            {displayName}
                          </span>
                          <span className="text-foreground/80">
                            {n.message}
                          </span>
                        </div>

                        {/* Time - top right, aligned */}
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap pt-0.5">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions - Visible on Hover (Desktop) or Right side (Mobile) */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleMarkAsRead(n);
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                          title="Mark as read">
                          <MailOpen className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(n);
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>

          {/* Footer - Only show if there's more content */}
          {hasMore && notifications.length > 0 && (
            <CardFooter className="flex justify-center py-4 bg-muted/5">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={handleLoadMore}
                className="text-muted-foreground hover:text-foreground">
                {loading ? "Loading..." : "Load older notifications"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
}
