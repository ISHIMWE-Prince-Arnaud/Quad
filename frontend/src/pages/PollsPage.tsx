import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PollService } from "@/services/pollService";
import type { Poll, PollQueryParams } from "@/types/poll";
import { SkeletonPost } from "@/components/ui/loading";
import { getSocket } from "@/lib/socket";
import type { FeedEngagementUpdatePayload } from "@/lib/socket";
import { logError } from "@/lib/errorHandling";

import { getErrorMessage } from "./polls/getErrorMessage";
import { PollCard } from "./polls/PollCard";
import { PollsHeader } from "./polls/PollsHeader";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // const handlePollUpdate = (updatedPoll: Poll) => {
  //   setPolls((prevPolls) =>
  //     prevPolls.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll))
  //   );
  // };

  const queryParams: PollQueryParams = useMemo(
    () => ({
      page,
      limit: 10,
    }),
    [page]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await PollService.getAll(queryParams);
        if (!cancelled && res.success) {
          setPolls(res.data || []);
          setHasMore(res.pagination?.hasMore ?? false);
        }
      } catch (err) {
        logError(err, { component: "PollsPage", action: "loadPolls", metadata: queryParams });
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  // Set up Socket.IO listeners for real-time poll updates
  useEffect(() => {
    const socket = getSocket();

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      if (payload.contentType === "poll") {
        setPolls((prevPolls) =>
          prevPolls.map((poll) => {
            if (poll.id === payload.contentId) {
              return {
                ...poll,
                totalVotes: payload.votes ?? poll.totalVotes,
                reactionsCount: payload.reactionsCount ?? poll.reactionsCount,
                commentsCount: payload.commentsCount ?? poll.commentsCount,
              };
            }
            return poll;
          })
        );
      }
    };

    socket.on("feed:engagement-update", handleEngagementUpdate);

    const handlePollExpired = (pollId: string) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) => {
          if (poll.id !== pollId) return poll;
          return {
            ...poll,
            status: "expired",
          };
        })
      );
    };

    socket.on("pollExpired", handlePollExpired);

    return () => {
      socket.off("feed:engagement-update", handleEngagementUpdate);
      socket.off("pollExpired", handlePollExpired);
    };
  }, []);

  const handleChangePage = (next: number) => {
    setPage(next);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <PollsHeader />

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && polls.length === 0 && (
          <div className="space-y-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonPost key={i} />
            ))}
          </div>
        )}

        {!loading && !error && polls.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No polls found.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>

        {!loading && hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleChangePage(page + 1)}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
