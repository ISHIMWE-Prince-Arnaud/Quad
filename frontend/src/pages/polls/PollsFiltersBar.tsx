import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { PollStatus } from "@/types/poll";

import type { SortKey, VotedFilter } from "./types";

export function PollsFiltersBar({
  status,
  sort,
  voted,
  onFilterChange,
}: {
  status: PollStatus | "all";
  sort: SortKey;
  voted: VotedFilter;
  onFilterChange: (
    next: Partial<{
      status: PollStatus | "all";
      sort: SortKey;
      voted: VotedFilter;
    }>
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-xl font-semibold">Polls</h1>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={status}
          onChange={(e) =>
            onFilterChange({
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
          onChange={(e) => onFilterChange({ sort: e.target.value as SortKey })}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="trending">Trending</option>
          <option value="mostVotes">Most Votes</option>
        </select>
        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={voted}
          onChange={(e) =>
            onFilterChange({
              voted: e.target.value as VotedFilter,
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
  );
}
