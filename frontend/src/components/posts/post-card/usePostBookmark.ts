import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function usePostBookmark(postId: string) {
  const [bookmarked, setBookmarked] = useState(false);

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
    try {
      const next = await BookmarkService.toggle("post", postId);
      setBookmarked(next);
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return { bookmarked, toggleBookmark };
}
