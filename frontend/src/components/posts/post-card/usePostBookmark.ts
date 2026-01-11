import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function usePostBookmark(postId: string) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await BookmarkService.isBookmarked("post", postId);
        if (!cancelled) setBookmarked(next);
      } catch {
        if (!cancelled) setBookmarked(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const toggleBookmark = async () => {
    if (bookmarkPending) return;

    const prev = bookmarked;
    const nextOptimistic = !prev;

    try {
      setBookmarkPending(true);
      setBookmarked(nextOptimistic);

      const next = await BookmarkService.toggle("post", postId);
      setBookmarked(next);
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setBookmarked(prev);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarkPending(false);
    }
  };

  return { bookmarked, bookmarkPending, toggleBookmark };
}
