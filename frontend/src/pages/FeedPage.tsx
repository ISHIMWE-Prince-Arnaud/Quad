import { useEffect, useState, useCallback, useRef } from "react";
import { useFeedStore, type FeedItem } from "@/stores/feedStore";
import { FeedService } from "@/services/feedService";
import { PostService } from "@/services/postService";
import { PostCard } from "@/components/posts/PostCard";
import { NewContentBanner } from "@/components/feed/NewContentBanner";
import { CreatePostModal } from "@/components/forms/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSocket } from "@/lib/socket";
import type {
  FeedNewContentPayload,
  FeedEngagementUpdatePayload,
  FeedContentDeletedPayload,
} from "@/lib/socket";
import type { FeedType } from "@/types/feed";
import type { CreatePostData } from "@/schemas/post.schema";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

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
          const items = response.data.items.map(
            (item) => item.content
          ) as FeedItem[];
          if (reset) {
            setFeedItems(items);
            if (items.length > 0) {
              setLastSeenId((items[0] as any)._id);
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
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
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
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* New Content Banner */}
      <NewContentBanner
        feedType={feedType}
        lastSeenId={lastSeenId}
        onRefresh={handleRefreshFeed}
      />

      {/* Feed Items - Single column layout with consistent spacing */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {feedItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index < 3 ? index * 0.1 : 0,
              }}>
              <PostCard post={item as any} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Skeleton Loading States */}
      {isLoading && feedItems.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger with Skeleton */}
      {hasMore && feedItems.length > 0 && (
        <div ref={loadMoreRef} className="mt-4">
          {isLoading && <PostCardSkeleton />}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && feedItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12">
          <p className="text-muted-foreground">
            {feedType === "following"
              ? "Follow some users to see their posts here"
              : "No posts available yet"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Skeleton component for loading states
function PostCardSkeleton() {
  return (
    <div className="w-full bg-card border border-border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-3 w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
        <Skeleton variant="text" className="h-4 w-4/6" />
      </div>

      {/* Media placeholder */}
      <Skeleton variant="rectangular" className="h-64 w-full rounded-lg" />

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t">
        <Skeleton variant="text" className="h-8 w-16" />
        <Skeleton variant="text" className="h-8 w-16" />
        <Skeleton variant="text" className="h-8 w-16" />
      </div>
    </div>
  );
}
