import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

import { EMPTY_REACTION_COUNTS, reactionEmojiMap } from "./constants";

export function useStoryReactions({
  storyId,
  initialTotal,
}: {
  storyId: string;
  initialTotal?: number;
}) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(initialTotal || 0);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    ...EMPTY_REACTION_COUNTS,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await ReactionService.getByContent("story", storyId);
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
        // Silent fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const selectedEmoji = useMemo(() => {
    return userReaction ? reactionEmojiMap[userReaction] : "👍";
  }, [userReaction]);

  const handleSelectReaction = useCallback(
    async (type: ReactionType) => {
      if (reactionPending) return;
      setReactionPending(true);

      const prevType = userReaction;
      const prevCount = reactionCount;
      const prevCounts = reactionCounts;

      const nextCounts: Record<ReactionType, number> = { ...prevCounts };
      if (prevType === type) {
        // Remove existing reaction of same type
        nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
        setUserReaction(null);
      } else {
        // If switching from another type, decrement that first
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
        const res = await ReactionService.toggle("story", storyId, type);
        if (!res.success) throw new Error(res.message || "Failed to react");

        if (res.data === null) {
          setUserReaction(null);
        } else if (res.data) {
          setUserReaction(res.data.type);
        }
      } catch (err: unknown) {
        // Revert on error
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
    },
    [reactionCount, reactionCounts, reactionPending, storyId, userReaction]
  );

  return {
    userReaction,
    reactionPending,
    reactionCount,
    selectedEmoji,
    handleSelectReaction,
  };
}
