import { useState } from "react";
import { showErrorToast } from "@/lib/error-handling/toasts";

import { CommentService } from "@/services/commentService";

export function useCommentLike({
  commentId,
  initialCount,
}: {
  commentId: string;
  initialCount: number;
}) {
  const [likesCount, setLikesCount] = useState<number>(initialCount);
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const toggleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    const prevLiked = liked;
    const prevCount = likesCount;

    try {
      setLiked(!prevLiked);
      setLikesCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));

      const res = await CommentService.toggleLike(commentId);
      if (!res.success) {
        throw new Error(res.message || "Failed to toggle like");
      }
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      const msg = e instanceof Error ? e.message : "Failed to update like on comment";
      showErrorToast(msg);
    } finally {
      setLikePending(false);
    }
  };

  return {
    likesCount,
    liked,
    likePending,
    toggleLike,
  };
}
