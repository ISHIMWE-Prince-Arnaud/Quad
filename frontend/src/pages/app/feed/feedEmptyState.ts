import type { FeedTab } from "@/types/feed";

export type FeedEmptyState = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
};

export const emptyStateCopy: Record<FeedTab, FeedEmptyState> = {
  home: {
    title: "Your feed is quiet",
    description:
      "Follow more people or share something to get the conversation going.",
  },
  posts: {
    title: "No posts yet",
    description: "Be the first to publish a post for this community.",
    secondaryActionLabel: "Back to Feed",
    secondaryActionHref: "/app/feed",
  },
  polls: {
    title: "No polls yet",
    description:
      "Start the conversation with a quick poll and gather votes in real time.",
    secondaryActionLabel: "Explore Polls",
    secondaryActionHref: "/app/polls",
  },
};
