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
import { Loader2 } from "lucide-react";
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

  // Reset pagination when filter changes
  useEffect(() => {
    setPage(1);
    setNotifications([]);
    setHasMore(true);
  }, [filter]);

  // Fetch notifications
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
        if (page === 1) {
          setNotifications(items);
        } else {
          setNotifications((prev) => [...prev, ...items]);
        }

        const pag = res.pagination;
        setHasMore(Boolean(pag?.hasMore));
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

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
    }
  };

  const handleFilterChange = (tab: FilterTab) => {
    setFilter(tab);
  };

  const handleMarkAsRead = async (notification: ApiNotification) => {
    if (notification.isRead) return;
    try {
      const res = await NotificationService.markAsRead(notification.id);
      if (!res.success) {
        throw new Error(res.message || "Failed to mark notification as read");
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      await fetchUnreadCount();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to mark notification as read";
      toast.error(msg);
    }
  };

  const handleDelete = async (notification: ApiNotification) => {
    try {
      const res = await NotificationService.deleteNotification(notification.id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete notification");
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      await fetchUnreadCount();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to delete notification";
      toast.error(msg);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await NotificationService.markAllAsRead();
      if (!res.success) {
        throw new Error(res.message || "Failed to mark all as read");
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetchUnreadCount();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to mark all as read";
      toast.error(msg);
    }
  };

  const handleClearRead = async () => {
    try {
      const res = await NotificationService.deleteAllRead();
      if (!res.success) {
        throw new Error(res.message || "Failed to clear read notifications");
      }
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to clear read notifications";
      toast.error(msg);
    }
  };

  const unreadLocalCount = notifications.filter((n) => !n.isRead).length;

  const handleNavigate = (notification: ApiNotification) => {
    const { contentType, contentId, type, actor } = notification;

    // Map notification to a target route
    let target: string | null = null;

    if (contentType === "post" && contentId) {
      target = `/app/posts/${contentId}`;
    } else if (contentType === "story" && contentId) {
      target = `/app/stories/${contentId}`;
    } else if (contentType === "poll" && contentId) {
      target = `/app/polls/${contentId}`;
    } else if (
      (contentType === "chat" || contentType === "conversation") &&
      contentId
    ) {
      target = `/app/chat/${contentId}`;
    } else if (type === "chat_mention") {
      // Fallback for chat mention without explicit contentType
      target = contentId ? `/app/chat/${contentId}` : "/app/chat";
    } else if (type === "follow" && actor?.username) {
      // Nice-to-have: follow notifications go to actor profile
      target = `/app/profile/${actor.username}`;
    }

    if (target) {
      navigate(target);
    }
  };

  return (
    <ComponentErrorBoundary componentName="NotificationsPage">
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Notifications
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                You have {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <div className="inline-flex rounded-full border bg-background text-xs">
                <button
                  type="button"
                  onClick={() => handleFilterChange("all")}
                  className={cn(
                    "px-3 py-1 rounded-full",
                    filter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}>
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("unread")}
                  className={cn(
                    "px-3 py-1 rounded-full",
                    filter === "unread"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}>
                  Unread ({unreadLocalCount})
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={notifications.length === 0}
                onClick={() => void handleMarkAllAsRead()}>
                Mark all as read
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={notifications.every((n) => !n.isRead)}
                onClick={() => void handleClearRead()}>
                Clear read
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {initialLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            )}

            {error && !initialLoading && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {!initialLoading && !error && notifications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No notifications to show.
              </p>
            )}

            <ul className="space-y-2">
              {notifications.map((notification) => {
                const actor = notification.actor;
                const displayName =
                  actor?.displayName || actor?.username || "Someone";

                const avatarInitial = displayName.charAt(0).toUpperCase();

                return (
                  <li key={notification.id}>
                    <div
                      className={cn(
                        "flex gap-3 rounded-lg border px-3 py-2 text-sm cursor-pointer hover:bg-accent/60 transition-colors",
                        notification.isRead
                          ? "bg-card"
                          : "bg-accent/40 border-primary/40"
                      )}
                      onClick={() => handleNavigate(notification)}>
                      <Avatar className="h-9 w-9 mt-0.5">
                        {actor?.profileImage && (
                          <AvatarImage
                            src={actor.profileImage}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="font-medium leading-tight truncate max-w-[220px] sm:max-w-xs">
                              {displayName}
                            </p>
                            <p className="text-xs text-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                            {timeAgo(notification.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {!notification.isRead && (
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleMarkAsRead(notification);
                              }}>
                              Mark as read
                            </button>
                          )}
                          <button
                            type="button"
                            className="hover:underline text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(notification);
                            }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {notifications.length} notification
              {notifications.length === 1 ? "" : "s"}.
            </p>
            {hasMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
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
