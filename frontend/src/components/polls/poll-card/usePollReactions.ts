import { useEffect, useRef, useState } from "react";
import { showErrorToast } from "@/lib/error-handling/toasts";

import { getSocket } from "@/lib/socket";
import type { FeedEngagementUpdatePayload } from "@/lib/socket";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";

export function usePollReactions(pollId: string, initialTotalCount = 0) {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(initialTotalCount);

  const prevPollIdRef = useRef(pollId);

  useEffect(() => {
    if (prevPollIdRef.current === pollId) return;
    prevPollIdRef.current = pollId;

    setUserReaction(null);
    setReactionPending(false);
    setReactionCount(initialTotalCount);
  }, [initialTotalCount, pollId]);

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

  useEffect(() => {
    const socket = getSocket();

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      if (payload.contentType !== "poll") return;
      if (String(payload.contentId) !== String(pollId)) return;
      if (typeof payload.reactionsCount !== "number") return;
      if (reactionPending) return;
      setReactionCount(payload.reactionsCount);
    };

    socket.on("feed:engagement-update", handleEngagementUpdate);

    return () => {
      socket.off("feed:engagement-update", handleEngagementUpdate);
    };
  }, [pollId, reactionPending]);

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

      if (typeof res.reactionCount === "number") {
        setReactionCount(res.reactionCount);
      }

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
      showErrorToast(msg);
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
