import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

export function usePollReactions(pollId: string, initialTotalCount = 0) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(initialTotalCount);

  useEffect(() => {
    setUserReaction(null);
    setReactionPending(false);
    setReactionCount(initialTotalCount);
  }, [pollId, initialTotalCount]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ReactionService.getByContent("poll", pollId);
        if (!cancelled && res.success && res.data) {
          const ur = res.data.userReaction;
          setUserReaction(ur ? ur.type : null);
          if (typeof res.data.totalCount === "number") {
            setReactionCount(res.data.totalCount);
          }
        }
      } catch {
        // Silent fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pollId]);

  const handleSelectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount;

    const wasReacted = prevType === type;
    const nextTotal = wasReacted ? Math.max(0, prevCount - 1) : prevCount + 1;
    setUserReaction(wasReacted ? null : type);
    setReactionCount(nextTotal);

    try {
      const res = await ReactionService.toggle("poll", pollId, type);
      if (!res.success) throw new Error(res.message || "Failed to react");

      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (err: unknown) {
      // Revert on error
      setUserReaction(prevType);
      setReactionCount(prevCount);
      let msg = "Failed to update reaction";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      toast.error(msg);
    } finally {
      setReactionPending(false);
    }
  };

  return {
    userReaction,
    reactionPending,
    reactionCount,
    handleSelectReaction,
  };
}
