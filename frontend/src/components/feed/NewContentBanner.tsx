import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FeedService } from "@/services/feedService";
import type { FeedType } from "@/types/feed";

interface NewContentBannerProps {
  feedType: FeedType;
  lastSeenId: string | null;
  onRefresh: () => void;
}

export function NewContentBanner({
  feedType,
  lastSeenId,
  onRefresh,
}: NewContentBannerProps) {
  const [newContentCount, setNewContentCount] = useState(0);
  const pollIntervalRef = useRef<number | null>(null);

  // Poll for new content count
  const pollNewContent = useCallback(async () => {
    if (!lastSeenId) return;

    try {
      const response = await FeedService.getNewContentCount({
        feedType,
        tab: "home",
        since: lastSeenId,
      });

      if (response.success && response.data) {
        setNewContentCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to poll new content:", error);
    }
  }, [feedType, lastSeenId]);

  // Set up polling for new content
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll immediately on mount
    pollNewContent();

    // Then poll every 30 seconds
    pollIntervalRef.current = setInterval(pollNewContent, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollNewContent]);

  // Reset count when feed type changes
  useEffect(() => {
    setNewContentCount(0);
  }, [feedType]);

  const handleClick = () => {
    setNewContentCount(0);
    onRefresh();
  };

  if (newContentCount === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Button onClick={handleClick} variant="outline" className="w-full">
        {newContentCount} new {newContentCount === 1 ? "post" : "posts"}
      </Button>
    </div>
  );
}
