import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import { logError } from "@/lib/errorHandling";

import { getErrorMessage } from "./getErrorMessage";

export function usePollVoting({
  id,
  poll,
  selectedIndices,
  setSelectedIndices,
  setPoll,
}: {
  id: string | undefined;
  poll: Poll | null;
  selectedIndices: number[];
  setSelectedIndices: Dispatch<SetStateAction<number[]>>;
  setPoll: Dispatch<SetStateAction<Poll | null>>;
}) {
  const [voting, setVoting] = useState(false);

  const canVote = useMemo(() => {
    if (!poll) return false;
    if (poll.status !== "active") return false;
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) return false;
    return true;
  }, [poll]);

  const toggleSelection = (index: number) => {
    if (!poll) return;
    if (poll.settings.allowMultiple) {
      setSelectedIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleVote = async () => {
    if (!id || !poll) return;
    if (!canVote) return;
    if (selectedIndices.length === 0) {
      toast.error("Select at least one option");
      return;
    }

    try {
      setVoting(true);
      const res = await PollService.vote(id, { optionIndices: selectedIndices });
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to submit vote");
        return;
      }
      setPoll(res.data);
      setSelectedIndices(res.data.userVote || []);
      toast.success("Vote recorded");
    } catch (err) {
      logError(err, { component: "PollVoting", action: "vote", metadata: { id, selectedIndices } });
      toast.error(getErrorMessage(err));
    } finally {
      setVoting(false);
    }
  };

  return {
    voting,
    canVote,
    toggleSelection,
    handleVote,
  };
}
