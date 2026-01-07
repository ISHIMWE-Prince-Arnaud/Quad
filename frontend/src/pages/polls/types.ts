import type { PollStatus } from "@/types/poll";

export type SortKey = "newest" | "oldest" | "trending" | "mostVotes";

export type VotedFilter = "all" | "voted" | "unvoted";

export type PollFilters = {
  search: string;
  status: PollStatus | "all";
  sort: SortKey;
  voted: VotedFilter;
};
