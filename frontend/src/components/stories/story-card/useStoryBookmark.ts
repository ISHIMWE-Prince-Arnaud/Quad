import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function useStoryBookmark(storyId: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await BookmarkService.isBookmarked("story", storyId);
        if (!cancelled) setBookmarked(next);
      } catch {
        if (!cancelled) setBookmarked(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const handleToggleBookmark = useCallback(async () => {
    try {
      const next = await BookmarkService.toggle("story", storyId);
      setBookmarked(next);
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  }, [storyId]);

  return { bookmarked, handleToggleBookmark };
}
