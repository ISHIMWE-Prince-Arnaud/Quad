import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService, type ReactionType } from "@/services/reactionService";
import { logError } from "@/lib/errorHandling";

export function usePollReactions({ id }: { id: string | undefined }) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [totalReactions, setTotalReactions] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await ReactionService.getByContent("poll", id);
        if (!cancelled && res.success && res.data) {
          setTotalReactions(res.data.totalCount ?? 0);
          setUserReaction(res.data.userReaction?.type ?? null);
        }
      } catch (err) {
        logError(err, { component: "PollReactions", action: "loadReactions", metadata: { id } });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSelectReaction = async (type: ReactionType) => {
    if (!id) return;
    const prevType = userReaction;

    const prevTotal = totalReactions;
    const wasReacted = prevType === type;
    const nextTotal = wasReacted ? Math.max(0, prevTotal - 1) : prevTotal + 1;
    setUserReaction(wasReacted ? null : type);
    setTotalReactions(nextTotal);

    try {
      const res = await ReactionService.toggle("poll", id, type);
      if (!res.success) throw new Error(res.message || "Failed to update reaction");

      if (typeof res.reactionCount === "number") {
        setTotalReactions(res.reactionCount);
      }
      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (err) {
      logError(err, {
        component: "PollReactions",
        action: "toggleReaction",
        metadata: { id, reactionType: type },
      });
      toast.error("Failed to update reaction");
      setUserReaction(prevType);
      setTotalReactions(prevTotal);
    }
  };

  return {
    userReaction,
    totalReactions,
    handleSelectReaction,
  };
}
