// --- Same imports as your original code ---
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
import { BellOff, Check, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

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

  const { fetchUnreadCount, unreadCount } = useNotificationStore();

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
      const res = await NotificationService.markAsRead(notification.id);
      if (!res.success)
        throw new Error(res.message || "Failed to mark notification as read");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      await fetchUnreadCount();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to mark notification as read"
      );
    }
  };

  const handleDelete = async (notification: ApiNotification) => {
    try {
      const res = await NotificationService.deleteNotification(notification.id);
      if (!res.success)
        throw new Error(res.message || "Failed to delete notification");

      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      await fetchUnreadCount();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to delete notification"
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    /* unchanged */
  };
  const handleClearRead = async () => {
    /* unchanged */
  };

  const unreadLocalCount = notifications.filter((n) => !n.isRead).length;

  const handleNavigate = (notification: ApiNotification) => {
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

    if (target) navigate(target);
  };

  // UI ------------------------------------------------------

  return (
    <ComponentErrorBoundary componentName="NotificationsPage">
      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-sm border-border/70">
          {/* Header */}
          <CardHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Notifications
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 && "s"}.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Filter segmented control */}
                <div className="inline-flex rounded-md border bg-card p-1">
                  {(["all", "unread"] as FilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleFilterChange(tab)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-md transition",
                        filter === tab
                          ? "bg-primary text-primary-foreground font-medium shadow"
                          : "text-muted-foreground hover:bg-accent/40"
                      )}>
                      {tab === "all" ? "All" : `Unread (${unreadLocalCount})`}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={notifications.length === 0}
                  onClick={() => void handleMarkAllAsRead()}>
                  Mark all read
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={notifications.every((n) => !n.isRead)}
                  onClick={() => void handleClearRead()}>
                  Clear read
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-4 pt-4">
            {/* Skeleton loading */}
            {initialLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted/30" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 bg-muted/30 rounded" />
                      <div className="h-3 w-full bg-muted/30 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !initialLoading && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Empty */}
            {!initialLoading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground py-10">
                <BellOff className="w-8 h-8 opacity-50" />
                <p className="text-sm">No notifications.</p>
              </div>
            )}

            {/* Notifications list */}
            <ul className="space-y-2">
              {notifications.map((n) => {
                const displayName =
                  n.actor?.displayName || n.actor?.username || "Someone";
                const avatarInitial = displayName.charAt(0).toUpperCase();

                return (
                  <li key={n.id}>
                    <div
                      className={cn(
                        "flex gap-3 rounded-md border p-3 cursor-pointer group transition",
                        n.isRead
                          ? "bg-card hover:bg-accent/40"
                          : "bg-primary/5 border-primary/40 hover:bg-primary/10"
                      )}
                      onClick={() => handleNavigate(n)}>
                      <Avatar className="h-10 w-10">
                        {n.actor?.profileImage ? (
                          <AvatarImage src={n.actor.profileImage} />
                        ) : (
                          <AvatarFallback className="text-primary">
                            {avatarInitial}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-medium leading-snug truncate max-w-[200px] sm:max-w-xs">
                            {displayName}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs mt-0.5 text-foreground line-clamp-2">
                          {n.message}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          {!n.isRead && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleMarkAsRead(n);
                              }}
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 flex gap-1">
                              <Check className="w-3 h-3" />
                              Mark read
                            </Button>
                          )}

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(n);
                            }}
                            size="sm"
                            variant="destructive"
                            className="h-6 px-2 flex gap-1">
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
            <span>
              Showing {notifications.length} notification
              {notifications.length !== 1 && "s"}.
            </span>

            {hasMore && (
              <Button
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={handleLoadMore}>
                {loading ? "Loading..." : "Load more"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
}
