import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function usePostBookmark(postId: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(BookmarkService.isBookmarked(postId));
  }, [postId]);

  const toggleBookmark = () => {
    const next = BookmarkService.toggle(postId);
    setBookmarked(next);
    toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
  };

  return { bookmarked, toggleBookmark };
}
