import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import { logError } from "@/lib/errorHandling";
import { getSocket } from "@/lib/socket";
import type { PollVotedPayload } from "@/lib/socket";

export function usePollVoting(poll: Poll, onUpdate?: (updatedPoll: Poll) => void) {
  // Local poll state for optimistic updates
  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    poll.userVote || []
  );
  const [voting, setVoting] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(Boolean(poll.canViewResults));

  // Update local state when poll prop changes
  useEffect(() => {
    setLocalPoll(poll);
    setSelectedIndices(poll.userVote || []);
    setResultsVisible(Boolean(poll.canViewResults));
  }, [poll]);

  // Real-time vote updates (other users voting)
  useEffect(() => {
    const socket = getSocket();

    const handlePollVoted = (payload: PollVotedPayload) => {
      if (!payload?.pollId) return;
      if (String(payload.pollId) !== String(poll.id)) return;

      setLocalPoll((prev) => {
        const totalVotes =
          typeof payload.totalVotes === "number" ? payload.totalVotes : prev.totalVotes;

        const options = prev.options.map((opt, idx) => {
          const optionIndex = typeof opt.index === "number" ? opt.index : idx;
          const votesCountRaw = payload.updatedVoteCounts?.[optionIndex];
          const votesCount =
            typeof votesCountRaw === "number" ? votesCountRaw : (opt.votesCount ?? 0);

          return {
            ...opt,
            votesCount,
            percentage: totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0,
          };
        });

        return {
          ...prev,
          totalVotes,
          options,
        };
      });
    };

    socket.on("pollVoted", handlePollVoted);

    return () => {
      socket.off("pollVoted", handlePollVoted);
    };
  }, [poll.id]);

  // Check if poll can be voted on
  const canVote = useMemo(() => {
    if (localPoll.status !== "active") return false;
    if (localPoll.expiresAt && new Date(localPoll.expiresAt) < new Date())
      return false;
    if ((localPoll.userVote || []).length > 0) return false;
    return true;
  }, [localPoll.status, localPoll.expiresAt, localPoll.userVote]);

  const voteOnOption = async (index: number) => {
    if (!canVote || voting) return;

    try {
      setVoting(true);
      setSelectedIndices([index]);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }

      // Optimistic update
      const optimisticPoll = { ...localPoll };
      const oldUserVote = optimisticPoll.userVote || [];
      optimisticPoll.userVote = [index];

      // Calculate new vote counts optimistically
      const newOptions = optimisticPoll.options.map((opt, idx) => {
        let newVotesCount = opt.votesCount ?? 0;

        // Remove old votes
        if (oldUserVote.includes(idx)) {
          newVotesCount = Math.max(0, newVotesCount - 1);
        }

        // Add new votes
        if (idx === index) {
          newVotesCount += 1;
        }

        return { ...opt, votesCount: newVotesCount };
      });

      // Calculate new total
      const newTotal = newOptions.reduce(
        (sum, opt) => sum + (opt.votesCount ?? 0),
        0
      );

      // Calculate percentages
      const optionsWithPercentages = newOptions.map((opt) => ({
        ...opt,
        percentage:
          newTotal > 0
            ? Math.round(((opt.votesCount ?? 0) / newTotal) * 100)
            : 0,
      }));

      optimisticPoll.options = optionsWithPercentages;
      optimisticPoll.totalVotes = newTotal;
      optimisticPoll.canViewResults = true;

      setLocalPoll(optimisticPoll);

      // 1) Instant feedback phase (selected highlight)
      // 2) Reveal results shortly after
      setResultsVisible(false);
      await new Promise((r) => setTimeout(r, 220));
      setResultsVisible(true);

      // Make API call
      const res = await PollService.vote(poll.id, {
        optionIndices: [index],
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to submit vote");
      }

      // Update with server response
      setLocalPoll(res.data);
      setSelectedIndices(res.data.userVote || []);
      setResultsVisible(Boolean(res.data.canViewResults));

      if (onUpdate) {
        onUpdate(res.data);
      }
    } catch (err: unknown) {
      logError(err, {
        component: "PollCardVoting",
        action: "vote",
        metadata: { pollId: poll.id },
      });
      // Revert optimistic update
      setLocalPoll(poll);
      setSelectedIndices(poll.userVote || []);
      setResultsVisible(Boolean(poll.canViewResults));

      let msg = "Failed to submit vote";
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
      setVoting(false);
    }
  };

  return {
    localPoll,
    selectedIndices,
    voting,
    canVote,
    resultsVisible,
    voteOnOption,
  };
}
