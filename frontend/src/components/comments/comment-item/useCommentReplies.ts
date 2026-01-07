import { useState } from "react";

import type { Comment } from "@/types/comment";
import { CommentService } from "@/services/commentService";

export function useCommentReplies({
  commentId,
  initialCount,
}: {
  commentId: string;
  initialCount: number;
}) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesCount, setRepliesCount] = useState<number>(initialCount);
  const [repliesSkip, setRepliesSkip] = useState(0);
  const [repliesLimit] = useState(10);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoadedOnce, setRepliesLoadedOnce] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const loadReplies = async (reset = false) => {
    if (repliesLoading) return;
    if (!reset && !repliesHasMore && repliesLoadedOnce) return;

    try {
      setRepliesLoading(true);
      const nextSkip = reset ? 0 : repliesSkip;
      const res = await CommentService.getReplies(commentId, {
        limit: repliesLimit,
        skip: nextSkip,
      });
      if (res.success) {
        const data = res.data || [];
        setReplies((prev) => (reset ? data : [...prev, ...data]));
        const pag = res.pagination;
        setRepliesSkip(nextSkip + data.length);
        setRepliesHasMore(Boolean(pag?.hasMore));
        setRepliesLoadedOnce(true);
      }
    } catch {
      // ignore
    } finally {
      setRepliesLoading(false);
    }
  };

  const toggleRepliesOpen = () => {
    const next = !repliesOpen;
    setRepliesOpen(next);
    if (next && !repliesLoadedOnce) {
      void loadReplies(true);
    }
  };

  const onReplyCreated = async () => {
    setRepliesCount((c) => c + 1);
    await loadReplies(true);
    setShowReplyComposer(false);
  };

  const onReplyDeleted = (id: string) => {
    setReplies((prev) => prev.filter((r) => r._id !== id));
    setRepliesCount((c) => Math.max(0, c - 1));
  };

  return {
    replies,
    repliesCount,
    repliesHasMore,
    repliesLoading,
    repliesOpen,
    showReplyComposer,
    setShowReplyComposer,
    loadReplies,
    toggleRepliesOpen,
    onReplyCreated,
    onReplyDeleted,
  };
}
