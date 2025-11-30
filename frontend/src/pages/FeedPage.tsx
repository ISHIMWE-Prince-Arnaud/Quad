import { useEffect, useState, useCallback, useRef } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { FeedService } from "@/services/feedService";
import { PostCard } from "@/components/posts/PostCard";
import { NewContentBanner } from "@/components/feed/NewContentBanner";
import { Loader2 } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type {
  FeedNewContentPayload,
  FeedEngagementUpdatePayload,
  FeedContentDeletedPayload,
} from "@/lib/socket";
import type { FeedType } from "@/types/feed";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function FeedPage() {
  const {
    feedItems,
    feedType,
    isLoading,
    hasMore,
    cursor,
    setFeedType,
    setFeedItems,
    addFeedItems,
    updateFeedItem,
    removeFeedItem,
    setLoading,
    setHasMore,
    setCursor,
    clearFeed,
  } = useFeedStore();

  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Load initial feed
  const loadFeed = useCallback(
    async (reset = false) => {
      if (isLoading) return;

      try {
        setLoading(true);
        const response = await FeedService.getFeed(feedType, {
          tab: "home",
          cursor: reset ? undefined : cursor || undefined,
          limit: 10,
          sort: "newest",
        });

        if (response.success && response.data) {
          const items = response.data.items.map((item) => item.content);
          if (reset) {
            setFeedItems(items);
            if (items.length > 0) {
              setLastSeenId(items[0]._id);
            }
          } else {
            addFeedItems(items);
          }
          setHasMore(response.data.pagination.hasMore);
          setCursor(response.data.pagination.nextCursor || null);
        }
      } catch (error) {
        console.error("Failed to load feed:", error);
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    },
    [
      feedType,
      cursor,
      isLoading,
      setLoading,
      setFeedItems,
      addFeedItems,
      setHasMore,
      setCursor,
    ]
  );

  // Handle tab change
  const handleTabChange = (type: FeedType) => {
    if (type === feedType) return;
    setFeedType(type);
  };

  // Handle refresh feed
  const handleRefreshFeed = () => {
    clearFeed();
    loadFeed(true);
  };

  // Load feed on mount and when feed type changes
  useEffect(() => {
    loadFeed(true);
  }, [feedType]);

  // Set up infinite scroll with Intersection Observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadFeed(false);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadFeed]);

  // Set up Socket.IO listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handleNewContent = (payload: FeedNewContentPayload) => {
      console.log("Feed new content:", payload);
      // The NewContentBanner component will handle polling and displaying the count
      // We don't need to do anything here as the banner polls the API
    };

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      console.log("Feed engagement update:", payload);
      updateFeedItem(payload.contentId, {
        reactionsCount: payload.reactionsCount,
        commentsCount: payload.commentsCount,
      });
    };

    const handleContentDeleted = (payload: FeedContentDeletedPayload) => {
      console.log("Feed content deleted:", payload);
      removeFeedItem(payload.contentId);
    };

    socket.on("feed:new-content", handleNewContent);
    socket.on("feed:engagement-update", handleEngagementUpdate);
    socket.on("feed:content-deleted", handleContentDeleted);

    // Join feed room
    socket.emit("feed:join");

    return () => {
      socket.off("feed:new-content", handleNewContent);
      socket.off("feed:engagement-update", handleEngagementUpdate);
      socket.off("feed:content-deleted", handleContentDeleted);
      socket.emit("feed:leave");
    };
  }, [updateFeedItem, removeFeedItem]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-6 border-b">
        <button
          onClick={() => handleTabChange("following")}
          className={cn(
            "px-4 py-3 font-semibold transition-colors relative",
            feedType === "following"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}>
          Following
          {feedType === "following" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("foryou")}
          className={cn(
            "px-4 py-3 font-semibold transition-colors relative",
            feedType === "foryou"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}>
          For You
          {feedType === "foryou" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* New Content Banner */}
      <NewContentBanner
        feedType={feedType}
        lastSeenId={lastSeenId}
        onRefresh={handleRefreshFeed}
      />

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <PostCard key={item._id} post={item} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && feedItems.length > 0 && (
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center">
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Loading State (initial load) */}
      {isLoading && feedItems.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && feedItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {feedType === "following"
              ? "Follow some users to see their posts here"
              : "No posts available yet"}
          </p>
        </div>
      )}
    </div>
  );
}
