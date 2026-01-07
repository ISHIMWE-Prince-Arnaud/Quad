import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { getSocket } from "@/lib/socket";
import type { FeedEngagementUpdatePayload } from "@/lib/socket";
import type { Poll } from "@/types/poll";

export function usePollEngagementSocket({
  id,
  setPoll,
}: {
  id: string | undefined;
  setPoll: Dispatch<SetStateAction<Poll | null>>;
}) {
  useEffect(() => {
    if (!id) return;

    const socket = getSocket();

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      if (payload.contentType === "poll" && payload.contentId === id) {
        setPoll((prevPoll) => {
          if (!prevPoll) return prevPoll;
          return {
            ...prevPoll,
            totalVotes: payload.votes ?? prevPoll.totalVotes,
            reactionsCount: payload.reactionsCount ?? prevPoll.reactionsCount,
            commentsCount: payload.commentsCount ?? prevPoll.commentsCount,
          };
        });
      }
    };

    socket.on("feed:engagement-update", handleEngagementUpdate);

    return () => {
      socket.off("feed:engagement-update", handleEngagementUpdate);
    };
  }, [id, setPoll]);
}
