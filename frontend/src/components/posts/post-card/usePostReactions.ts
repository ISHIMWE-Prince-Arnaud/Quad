import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

import { EMPTY_REACTION_COUNTS, reactionEmojiMap } from "./constants";

export function usePostReactions(postId: string) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number | undefined>(
    undefined
  );
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionType, number>
  >(() => ({ ...EMPTY_REACTION_COUNTS }));

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

          if (Array.isArray(res.data.reactionCounts)) {
            const nextCounts: Record<ReactionType, number> = {
              ...EMPTY_REACTION_COUNTS,
            };
            for (const rc of res.data.reactionCounts) {
              nextCounts[rc.type] = rc.count;
            }
            setReactionCounts(nextCounts);
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

  const selectedEmoji = useMemo(
    () => (userReaction ? reactionEmojiMap[userReaction] : "👍"),
    [userReaction]
  );

  const selectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount ?? 0;
    const prevCounts = reactionCounts;

    const nextCounts: Record<ReactionType, number> = { ...prevCounts };
    if (prevType === type) {
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
      setUserReaction(null);
    } else {
      if (prevType) {
        nextCounts[prevType] = Math.max(0, (nextCounts[prevType] ?? 0) - 1);
      }
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
      setUserReaction(type);
    }

    const nextTotal = (Object.values(nextCounts) as number[]).reduce(
      (sum, value) => sum + value,
      0
    );
    setReactionCounts(nextCounts);
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
      setReactionCounts(prevCounts);
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
    reactionCounts,
    selectedEmoji,
    selectReaction,
  };
}
