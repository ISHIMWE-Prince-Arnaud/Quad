import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function useStoryBookmark(storyId: string) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);

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
    if (bookmarkPending) return;

    const prev = bookmarked;
    const nextOptimistic = !prev;

    try {
      setBookmarkPending(true);
      setBookmarked(nextOptimistic);

      const next = await BookmarkService.toggle("story", storyId);
      setBookmarked(next);
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setBookmarked(prev);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarkPending(false);
    }
  }, [bookmarked, bookmarkPending, storyId]);

  return { bookmarked, bookmarkPending, handleToggleBookmark };
}
