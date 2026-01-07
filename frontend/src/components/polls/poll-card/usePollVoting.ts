import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";

export function usePollVoting(poll: Poll, onUpdate?: (updatedPoll: Poll) => void) {
  // Local poll state for optimistic updates
  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    poll.userVote || []
  );
  const [voting, setVoting] = useState(false);

  // Update local state when poll prop changes
  useEffect(() => {
    setLocalPoll(poll);
    setSelectedIndices(poll.userVote || []);
  }, [poll]);

  // Check if poll can be voted on
  const canVote = useMemo(() => {
    if (localPoll.status !== "active") return false;
    if (localPoll.expiresAt && new Date(localPoll.expiresAt) < new Date())
      return false;
    return true;
  }, [localPoll.status, localPoll.expiresAt]);

  const toggleSelection = (index: number) => {
    if (!canVote) return;

    if (localPoll.settings.allowMultiple) {
      setSelectedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleVote = async () => {
    if (!canVote || voting) return;
    if (selectedIndices.length === 0) {
      toast.error("Please select at least one option");
      return;
    }

    try {
      setVoting(true);

      // Optimistic update
      const optimisticPoll = { ...localPoll };
      const oldUserVote = optimisticPoll.userVote || [];
      optimisticPoll.userVote = selectedIndices;

      // Calculate new vote counts optimistically
      const newOptions = optimisticPoll.options.map((opt, idx) => {
        let newVotesCount = opt.votesCount ?? 0;

        // Remove old votes
        if (oldUserVote.includes(idx)) {
          newVotesCount = Math.max(0, newVotesCount - 1);
        }

        // Add new votes
        if (selectedIndices.includes(idx)) {
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

      // Make API call
      const res = await PollService.vote(poll.id, {
        optionIndices: selectedIndices,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to submit vote");
      }

      // Update with server response
      setLocalPoll(res.data);
      setSelectedIndices(res.data.userVote || []);

      if (onUpdate) {
        onUpdate(res.data);
      }

      toast.success("Vote recorded!");
    } catch (err: unknown) {
      console.error(err);
      // Revert optimistic update
      setLocalPoll(poll);
      setSelectedIndices(poll.userVote || []);

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

  const handleRemoveVote = async () => {
    if (voting) return;

    try {
      setVoting(true);

      // Optimistic update
      const optimisticPoll = { ...localPoll };
      const oldUserVote = optimisticPoll.userVote || [];
      optimisticPoll.userVote = [];

      // Calculate new vote counts optimistically
      const newOptions = optimisticPoll.options.map((opt, idx) => {
        let newVotesCount = opt.votesCount ?? 0;

        // Remove old votes
        if (oldUserVote.includes(idx)) {
          newVotesCount = Math.max(0, newVotesCount - 1);
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

      setLocalPoll(optimisticPoll);
      setSelectedIndices([]);

      // Make API call
      const res = await PollService.removeVote(poll.id);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to remove vote");
      }

      // Update with server response
      setLocalPoll(res.data);
      setSelectedIndices(res.data.userVote || []);

      if (onUpdate) {
        onUpdate(res.data);
      }

      toast.success("Vote removed");
    } catch (err: unknown) {
      console.error(err);
      // Revert optimistic update
      setLocalPoll(poll);
      setSelectedIndices(poll.userVote || []);

      let msg = "Failed to remove vote";
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
    toggleSelection,
    handleVote,
    handleRemoveVote,
  };
}
