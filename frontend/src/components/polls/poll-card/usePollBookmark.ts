import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function usePollBookmark(pollId: string) {
  const [bookmarked, setBookmarked] = useState(false);

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
    try {
      const next = await BookmarkService.toggle("poll", pollId);
      setBookmarked(next);
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return { bookmarked, toggleBookmark };
}
