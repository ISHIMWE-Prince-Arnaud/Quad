import { useEffect, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";

import { BookmarkService } from "@/services/bookmarkService";

export function usePollBookmark(pollId: string) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await BookmarkService.isBookmarked("poll", pollId);
        if (!cancelled) setBookmarked(next);
      } catch {
        if (!cancelled) setBookmarked(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const toggleBookmark = async () => {
    if (bookmarkPending) return;

    const prev = bookmarked;
    const nextOptimistic = !prev;

    try {
      setBookmarkPending(true);
      setBookmarked(nextOptimistic);

      const next = await BookmarkService.toggle("poll", pollId);
      setBookmarked(next);
      showSuccessToast(next ? "Saved" : "Removed");
    } catch {
      setBookmarked(prev);
      showErrorToast("Failed to update bookmark");
    } finally {
      setBookmarkPending(false);
    }
  };

  return { bookmarked, bookmarkPending, toggleBookmark };
}
