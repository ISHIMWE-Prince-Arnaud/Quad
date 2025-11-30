import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PollService } from "@/services/pollService";
import type { Poll, PollQueryParams, PollStatus } from "@/types/poll";
import { SkeletonPost } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import type { FeedEngagementUpdatePayload } from "@/lib/socket";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

type SortKey = "newest" | "oldest" | "trending" | "mostVotes";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<PollStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [voted, setVoted] = useState<"all" | "voted" | "unvoted">("all");

  const handlePollUpdate = (updatedPoll: Poll) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) => (poll.id === updatedPoll.id ? updatedPoll : poll))
    );
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: PollQueryParams = useMemo(
    () => ({
      page,
      limit: 10,
      status,
      search: debouncedSearch || undefined,
      sort,
      voted: voted === "all" ? undefined : voted === "voted" ? true : false,
    }),
    [page, status, debouncedSearch, sort, voted]
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
        console.error(err);
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

    return () => {
      socket.off("feed:engagement-update", handleEngagementUpdate);
    };
  }, []);

  const handleChangePage = (next: number) => {
    setPage(next);
  };

  const handleFilterChange = (
    next: Partial<{
      status: PollStatus | "all";
      sort: SortKey;
      voted: "all" | "voted" | "unvoted";
      search: string;
    }>
  ) => {
    if (next.status !== undefined) setStatus(next.status);
    if (next.sort !== undefined) setSort(next.sort);
    if (next.voted !== undefined) setVoted(next.voted);
    if (next.search !== undefined) setSearch(next.search);
    setPage(1);
  };

  const renderPollOptionBar = (poll: Poll, optionIndex: number) => {
    const opt = poll.options[optionIndex];
    if (!opt) return null;
    const votesCount = opt.votesCount ?? 0;
    const percentage =
      typeof opt.percentage === "number"
        ? opt.percentage
        : poll.totalVotes > 0
        ? Math.round((votesCount / poll.totalVotes) * 100)
        : 0;

    return (
      <div key={optionIndex} className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="truncate">{opt.text}</span>
          {poll.canViewResults && (
            <span className="text-muted-foreground">{percentage}%</span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${poll.canViewResults ? percentage : 0}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold">Polls</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Search polls..."
              className="w-44 md:w-56"
            />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={status}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.value as PollStatus | "all",
                })
              }>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={sort}
              onChange={(e) =>
                handleFilterChange({ sort: e.target.value as SortKey })
              }>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="trending">Trending</option>
              <option value="mostVotes">Most Votes</option>
            </select>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={voted}
              onChange={(e) =>
                handleFilterChange({
                  voted: e.target.value as "all" | "voted" | "unvoted",
                })
              }>
              <option value="all">All</option>
              <option value="voted">I voted</option>
              <option value="unvoted">Not voted</option>
            </select>
            <Button asChild size="sm">
              <Link to="/app/create/poll">Create poll</Link>
            </Button>
          </div>
        </div>

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
            <motion.div
              key={poll.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex flex-col gap-1 text-base font-medium">
                    <Link
                      to={`/app/polls/${poll.id}`}
                      className="hover:underline">
                      {poll.question}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>by {poll.author.username}</span>
                      <span>
                        {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
                      </span>
                      {poll.expiresAt && (
                        <span>
                          Expires {new Date(poll.expiresAt).toLocaleString()}
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide">
                        {poll.status}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 pb-4">
                  {poll.options.length > 0 && (
                    <div className="space-y-2">
                      {poll.options
                        .slice(0, 4)
                        .map((_, idx) => renderPollOptionBar(poll, idx))}
                    </div>
                  )}
                  {!poll.canViewResults && (
                    <p className="text-xs text-muted-foreground">
                      Results are hidden until you vote or the poll expires.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
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
