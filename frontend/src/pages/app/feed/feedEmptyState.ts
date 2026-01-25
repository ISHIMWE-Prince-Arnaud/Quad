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
    actionLabel: "Create Post",
    actionHref: "/app/create",
  },
  posts: {
    title: "No posts yet",
    description: "Be the first to publish a post for this community.",
    actionLabel: "Create Post",
    actionHref: "/app/create/post",
    secondaryActionLabel: "Back to Feed",
    secondaryActionHref: "/app/feed",
  },
  stories: {
    title: "No stories yet",
    description: "Share a long-form update or experience with the community.",
    actionLabel: "Create Story",
    actionHref: "/app/create/story",
    secondaryActionLabel: "Browse Stories",
    secondaryActionHref: "/app/stories",
  },
  polls: {
    title: "No polls yet",
    description:
      "Start the conversation with a quick poll and gather votes in real time.",
    actionLabel: "Create Poll",
    actionHref: "/app/create/poll",
    secondaryActionLabel: "Explore Polls",
    secondaryActionHref: "/app/polls",
  },
};
