import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

export function useCommentReactions({
  commentId,
  initialCount,
}: {
  commentId: string;
  initialCount: number;
}) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(initialCount);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ReactionService.getByContent("comment", commentId);
        if (!cancelled && res.success && res.data) {
          const ur = res.data.userReaction;
          setUserReaction(ur ? ur.type : null);
          if (typeof res.data.totalCount === "number") {
            setReactionCount(res.data.totalCount);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commentId]);

  const selectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount;

    const wasReacted = prevType === type;
    const nextTotal = wasReacted ? Math.max(0, prevCount - 1) : prevCount + 1;
    setUserReaction(wasReacted ? null : type);
    setReactionCount(nextTotal);

    try {
      const res = await ReactionService.toggle("comment", commentId, type);
      if (!res.success) throw new Error(res.message || "Failed to react");
      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (e) {
      setUserReaction(prevType);
      setReactionCount(prevCount);
      const msg = e instanceof Error ? e.message : "Failed to update reaction";
      toast.error(msg);
    } finally {
      setReactionPending(false);
    }
  };

  return {
    userReaction,
    reactionPending,
    reactionCount,
    selectReaction,
  };
}
