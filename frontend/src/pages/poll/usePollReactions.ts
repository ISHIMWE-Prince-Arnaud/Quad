import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService, type ReactionType } from "@/services/reactionService";

import { EMPTY_REACTION_COUNTS } from "./constants";

export function usePollReactions({ id }: { id: string | undefined }) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionType, number>
  >(() => ({ ...EMPTY_REACTION_COUNTS }));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await ReactionService.getByContent("poll", id);
        if (!cancelled && res.success && res.data) {
          const next: Record<ReactionType, number> = { ...EMPTY_REACTION_COUNTS };
          for (const rc of res.data.reactionCounts) {
            next[rc.type] = rc.count;
          }
          setReactionCounts(next);
          setUserReaction((res.data.userReaction?.type as ReactionType) || null);
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalReactions = useMemo(
    () => (Object.values(reactionCounts) as number[]).reduce((a, b) => a + b, 0),
    [reactionCounts]
  );

  const handleSelectReaction = async (type: ReactionType) => {
    if (!id) return;
    const prevType = userReaction;
    const prevCounts = { ...reactionCounts };

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
    setReactionCounts(nextCounts);

    try {
      if (prevType === type) {
        const res = await ReactionService.remove("poll", id);
        if (!res.success) throw new Error(res.message || "Failed to remove");
      } else {
        const res = await ReactionService.toggle("poll", id, type);
        if (!res.success) throw new Error(res.message || "Failed to react");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reaction");
      setReactionCounts(prevCounts);
      setUserReaction(prevType);
    }
  };

  return {
    userReaction,
    reactionCounts,
    totalReactions,
    handleSelectReaction,
  };
}
