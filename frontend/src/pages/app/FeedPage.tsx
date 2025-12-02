import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { FeedSkeleton } from "@/components/ui/loading";
import { PageTransition } from "@/components/ui/page-transition";
import { FeedService } from "@/services/feedService";
import { PostService } from "@/services/postService";
import type { Post } from "@/types/post";
import type { FeedItem, FeedTab, FeedType } from "@/types/feed";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";
import type {
  FeedEngagementUpdatePayload,
  FeedContentDeletedPayload,
} from "@/lib/socket";

function getFeedItemKey(item: FeedItem): string {
  if (item.type === "post") {
    const content = item.content as Post;
    return `post:${content._id}`;
  }

  return `${item.type}:${String(item._id)}`;
}

function dedupeFeedItems(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getFeedItemKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

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

  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling setup - only enable for lists with 100+ items
  const shouldUseVirtualization = items.length >= 100;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated feed item height
    overscan: 3, // Render 3 extra items above and below viewport
    enabled: shouldUseVirtualization,
  });

  const handleRefreshFeed = useCallback(async () => {
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
      const dedupedItems = dedupeFeedItems(data.items || []);
      setItems(dedupedItems);
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
      setLastSeenId(
        dedupedItems.length > 0 ? String(dedupedItems[0]._id) : null
      );
    } catch (err: unknown) {
      console.error("Error refreshing feed:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [feedType, tab, loading]);

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
          const dedupedItems = dedupeFeedItems(data.items);
          setItems(dedupedItems);
          setCursor(data.pagination.nextCursor || null);
          setHasMore(Boolean(data.pagination.hasMore));
          setLastSeenId(
            dedupedItems.length > 0 ? String(dedupedItems[0]._id) : null
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
      const nearTop = window.scrollY < 120;
      if (nearTop && !loading) {
        void handleRefreshFeed();
      } else {
        setNewCount((c) => c + 1);
      }
    };

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      setItems((prev) =>
        prev.map((it) => {
          // Match by aggregated item id
          const sameItem = String(it._id) === String(payload.contentId);

          if (payload.contentType === "post" && it.type === "post") {
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
                engagementMetrics: {
                  ...it.engagementMetrics,
                  reactions:
                    payload.reactionsCount ?? it.engagementMetrics.reactions,
                  comments:
                    payload.commentsCount ?? it.engagementMetrics.comments,
                },
              } as FeedItem;
            }
          }

          if (payload.contentType === "poll" && it.type === "poll") {
            if (sameItem && typeof payload.votes === "number") {
              return {
                ...it,
                engagementMetrics: {
                  ...it.engagementMetrics,
                  votes: payload.votes,
                },
              } as FeedItem;
            }
          }

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
  }, [handleRefreshFeed, loading]);

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
      const newItems = dedupeFeedItems(data.items || []);

      setItems((prev) => dedupeFeedItems([...prev, ...newItems]));
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
    } catch (err: unknown) {
      console.error("Error loading more feed items:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  // Keep handleRefreshFeed for banner click

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
      <PageTransition>
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
          {loading && items.length === 0 && <FeedSkeleton />}

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
              {shouldUseVirtualization ? (
                <div
                  ref={parentRef}
                  className="space-y-6"
                  style={{
                    height: "calc(100vh - 300px)",
                    overflow: "auto",
                  }}>
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}>
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                      const item = items[virtualItem.index];
                      return (
                        <div
                          key={virtualItem.key}
                          data-index={virtualItem.index}
                          ref={virtualizer.measureElement}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                          className="pb-6">
                          {item.type === "post" ? (
                            <PostCard
                              post={item.content as Post}
                              onDelete={handleDelete}
                            />
                          ) : (
                            <Card className="shadow-sm">
                              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                                {item.type === "poll"
                                  ? "Poll item will be shown here in a future phase."
                                  : "Story item will be shown here in a future phase."}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
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
                </>
              )}

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
      </PageTransition>
    </ComponentErrorBoundary>
  );
}
