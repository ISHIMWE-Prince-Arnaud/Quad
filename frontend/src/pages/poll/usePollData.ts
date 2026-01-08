import { useEffect, useState } from "react";

import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import { logError } from "@/lib/errorHandling";

import { getErrorMessage } from "./getErrorMessage";

export function usePollData({ id }: { id: string | undefined }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await PollService.getById(id);
        if (!cancelled && res.success && res.data) {
          setPoll(res.data);
          setSelectedIndices(res.data.userVote || []);
        }
      } catch (err) {
        logError(err, { component: "PollData", action: "loadPoll", metadata: { id } });
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    poll,
    setPoll,
    loading,
    error,
    selectedIndices,
    setSelectedIndices,
  };
}
