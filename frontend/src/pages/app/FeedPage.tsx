import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { FeedService } from "@/services/feedService";
import { PostService } from "@/services/postService";
import { useAuthStore } from "@/stores/authStore";
import type { Post } from "@/types/post";
import type { FeedItem, FeedTab, FeedType } from "@/types/feed";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";
import type {
  FeedEngagementUpdatePayload,
  FeedContentDeletedPayload,
} from "@/lib/socket";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

export default function FeedPage() {
  const { user } = useAuthStore();

  const [feedType, setFeedType] = useState<FeedType>("foryou");
  const [tab, setTab] = useState<FeedTab>("home");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  // Load initial feed whenever feedType or tab changes
  useEffect(() => {
    let isCancelled = false;

    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        setItems([]);
        setCursor(null);
        setHasMore(true);
        setNewCount(0);

        const response = await FeedService.getFeed(feedType, {
          tab,
          limit: 20,
          sort: "newest",
        });

        if (!response.success) {
          if (!isCancelled) {
            setError(response.message || "Failed to load feed");
          }
          return;
        }

        const data = response.data;
        if (!data || !Array.isArray(data.items)) {
          if (!isCancelled) {
            setError("Unexpected feed response");
          }
          return;
        }

        if (!isCancelled) {
          setItems(data.items);
          setCursor(data.pagination.nextCursor || null);
          setHasMore(Boolean(data.pagination.hasMore));
          setLastSeenId(
            data.items.length > 0 ? String(data.items[0]._id) : null
          );
        }
      } catch (err: unknown) {
        console.error("Error fetching feed:", err);
        if (!isCancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      isCancelled = true;
    };
  }, [feedType, tab]);

  // Periodically check for new content based on last seen ID
  useEffect(() => {
    if (!lastSeenId) return;

    const interval = setInterval(async () => {
      try {
        const response = await FeedService.getNewContentCount({
          feedType,
          tab,
          since: lastSeenId,
        });

        if (response.success && typeof response.data?.count === "number") {
          setNewCount(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching new content count:", err);
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [feedType, tab, lastSeenId]);

  // Real-time feed events
  useEffect(() => {
    const socket = getSocket();

    const handleNewContent = () => {
      // Non-blocking banner/toast for new content
      setNewCount((c) => c + 1);
    };

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      setItems((prev) =>
        prev.map((it) => {
          // Try match by item id first
          const sameItem = String(it._id) === String(payload.contentId);
          if (it.type === "post") {
            const content = it.content as Post;
            const sameContent =
              String(content._id) === String(payload.contentId);
            if (sameItem || sameContent) {
              return {
                ...it,
                content: {
                  ...content,
                  reactionsCount:
                    payload.reactionsCount ?? content.reactionsCount,
                  commentsCount: payload.commentsCount ?? content.commentsCount,
                },
              } as FeedItem;
            }
          }
          // For non-posts we keep as-is for now (placeholders)
          return it;
        })
      );
    };

    const handleContentDeleted = (payload: FeedContentDeletedPayload) => {
      setItems((prev) =>
        prev.filter((it) => {
          if (String(it._id) === String(payload.contentId)) return false;
          if (it.type === "post") {
            const content = it.content as Post;
            if (String(content._id) === String(payload.contentId)) return false;
          }
          return true;
        })
      );
    };

    socket.on("feed:new-content", handleNewContent);
    socket.on("feed:engagement-update", handleEngagementUpdate);
    socket.on("feed:content-deleted", handleContentDeleted);

    return () => {
      socket.off("feed:new-content", handleNewContent);
      socket.off("feed:engagement-update", handleEngagementUpdate);
      socket.off("feed:content-deleted", handleContentDeleted);
    };
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || !cursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await FeedService.getFeed(feedType, {
        tab,
        cursor,
        limit: 20,
        sort: "newest",
      });

      if (!response.success) {
        toast.error(response.message || "Failed to load more content");
        return;
      }

      const data = response.data;
      const newItems = data.items || [];

      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => String(item._id)));
        const merged = [
          ...prev,
          ...newItems.filter((item) => !existingIds.has(String(item._id))),
        ];
        return merged;
      });
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
    } catch (err: unknown) {
      console.error("Error loading more feed items:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefreshFeed = async () => {
    // Re-trigger initial fetch by updating lastSeenId to null then back via effect
    if (loading) return;
    setLastSeenId(null);
    setNewCount(0);

    try {
      setLoading(true);
      setError(null);

      const response = await FeedService.getFeed(feedType, {
        tab,
        limit: 20,
        sort: "newest",
      });

      if (!response.success) {
        setError(response.message || "Failed to refresh feed");
        return;
      }

      const data = response.data;
      setItems(data.items || []);
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
      setLastSeenId(data.items.length > 0 ? String(data.items[0]._id) : null);
    } catch (err: unknown) {
      console.error("Error refreshing feed:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await PostService.deletePost(postId);

      if (response.success) {
        setItems((prev) =>
          prev.filter((item) => {
            if (item.type !== "post") return true;
            const content = item.content as Post;
            return content._id !== postId;
          })
        );
        toast.success("Post deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete post");
      }
    } catch (err: unknown) {
      console.error("Error deleting post:", err);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <ComponentErrorBoundary>
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Feed type tabs */}
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full border p-1 bg-muted/40">
            <Button
              type="button"
              size="sm"
              variant={feedType === "foryou" ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setFeedType("foryou")}>
              For You
            </Button>
            <Button
              type="button"
              size="sm"
              variant={feedType === "following" ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setFeedType("following")}>
              Following
            </Button>
          </div>

          {/* Content tabs */}
          <div className="flex gap-1 text-sm">
            {(
              [
                ["home", "Home"],
                ["posts", "Posts"],
                ["stories", "Stories"],
                ["polls", "Polls"],
              ] as [FeedTab, string][]
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={tab === value ? "secondary" : "ghost"}
                className="px-3"
                onClick={() => setTab(value)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
        {/* Create Post Card */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.firstName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-muted-foreground"
                asChild>
                <Link to="/app/create">What's on your mind?</Link>
              </Button>
              <Button size="icon" className="shrink-0" asChild>
                <Link to="/app/create">
                  <Plus className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* New content banner */}
        {newCount > 0 && !loading && (
          <Card
            className="shadow-sm border-primary/20 bg-primary/5 cursor-pointer"
            onClick={handleRefreshFeed}>
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                {newCount} new {newCount === 1 ? "update" : "updates"} in your
                feed
              </span>
              <Button size="sm" variant="outline">
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something!
              </p>
              <Button asChild>
                <Link to="/app/create">Create Post</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Feed list */}
        {!loading && !error && items.length > 0 && (
          <>
            {items.map((item) => {
              if (item.type === "post") {
                const post = item.content as Post;
                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handleDelete}
                  />
                );
              }

              // Placeholder for polls and stories until dedicated cards are implemented
              return (
                <Card key={String(item._id)} className="shadow-sm">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    {item.type === "poll"
                      ? "Poll item will be shown here in a future phase."
                      : "Story item will be shown here in a future phase."}
                  </CardContent>
                </Card>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}>
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}
