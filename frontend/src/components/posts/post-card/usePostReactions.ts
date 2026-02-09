import { useEffect, useState } from "react";
import { showErrorToast } from "@/lib/error-handling/toasts";

import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

export function usePostReactions(postId: string) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await ReactionService.getByContent("post", postId);
        if (!cancelled && res.success && res.data) {
          const ur = res.data.userReaction;
          setUserReaction(ur ? ur.type : null);
          if (typeof res.data.totalCount === "number") {
            setReactionCount(res.data.totalCount);
          }
        }
      } catch {
        // Silent fail; keep initial counts
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const selectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount ?? 0;

    const wasReacted = prevType === type;
    const nextTotal = wasReacted ? Math.max(0, prevCount - 1) : prevCount + 1;
    setUserReaction(wasReacted ? null : type);
    setReactionCount(nextTotal);

    try {
      const res = await ReactionService.toggle("post", postId, type);
      if (!res.success) throw new Error(res.message || "Failed to react");

      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (err: unknown) {
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
      showErrorToast(msg);
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
