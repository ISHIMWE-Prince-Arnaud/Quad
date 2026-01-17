import { useState } from "react";

import type { Comment } from "@/types/comment";

export function useCommentReplies({
  commentId,
  initialCount,
}: {
  commentId: string;
  initialCount: number;
}) {
  useState(commentId);
  const [replies] = useState<Comment[]>([]);
  const [repliesCount] = useState<number>(initialCount);
  const [repliesHasMore] = useState(false);
  const [repliesLoading] = useState(false);
  const [repliesOpen] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const loadReplies = async () => {
    return;
  };

  const toggleRepliesOpen = () => {
    return;
  };

  const onReplyCreated = async () => {
    return;
  };

  const onReplyDeleted = () => {
    return;
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
