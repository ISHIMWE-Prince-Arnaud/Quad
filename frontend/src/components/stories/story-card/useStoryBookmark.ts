import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { BookmarkService } from "@/services/bookmarkService";

export function useStoryBookmark(storyId: string) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(BookmarkService.isBookmarked(storyId));
  }, [storyId]);

  const handleToggleBookmark = useCallback(() => {
    const next = BookmarkService.toggle(storyId);
    setBookmarked(next);
    toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
  }, [storyId]);

  return { bookmarked, handleToggleBookmark };
}
