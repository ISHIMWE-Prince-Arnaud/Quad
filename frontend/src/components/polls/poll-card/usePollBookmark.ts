import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function usePollBookmark(pollId: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(BookmarkService.isBookmarked(pollId));
  }, [pollId]);

  const toggleBookmark = () => {
    const next = BookmarkService.toggle(pollId);
    setBookmarked(next);
    toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
  };

  return { bookmarked, toggleBookmark };
}
