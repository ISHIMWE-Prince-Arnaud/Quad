import type { IPost } from "./post.types.js";
import type { IPoll } from "./poll.types.js";
import type { IStory } from "./story.types.js";

/**
 * Feed Types
 */
export type FeedType = "following" | "foryou";

/**
 * Content Tabs
 */
export type ContentTab = "home" | "posts" | "polls" | "stories";

/**
 * Sort Options
 */
export type FeedSort = "newest" | "trending";

/**
 * Content Priority
 */
export type ContentPriority = "following" | "discover";

/**
 * Feed Item Type
 */
export type FeedItemType = "post" | "poll" | "story";

/**
 * Base Feed Item
 */
export interface IFeedItem {
  _id: string;
  type: FeedItemType;
  content: IPost | IPoll | IStory;
  score: number;
  priority: ContentPriority;
  createdAt: Date;
  authorId: string;
  engagementMetrics: {
    reactions: number;
    comments: number;
    votes: number; // polls have votes, others have 0
  };
  author: {
    clerkId: string;
    username: string;
    profileImage: string | undefined;
  };
}

/**
 * Feed Response
 */
export interface IFeedResponse {
  items: IFeedItem[];
  pagination: {
    nextCursor: string | undefined;
    hasMore: boolean;
    count: number;
  };
  metadata: {
    feedType: FeedType;
    tab: ContentTab;
    sort: FeedSort;
    totalAvailable?: number;
  };
}

/**
 * Scoring Weights
 */
export interface IScoringWeights {
  recency: number;
  engagement: number;
  following: number;
  popularity: number;
}

/**
 * Content Quality Filters
 */
export interface IContentFilters {
  maxAge?: number; // days
  minEngagement?: number;
  excludeExpiredStories?: boolean;
  excludeClosedPolls?: boolean;
}

/**
 * Feed Query Options
 */
export interface IFeedQueryOptions {
  userId: string;
  feedType: FeedType;
  tab: ContentTab;
  sort: FeedSort;
  cursor?: string;
  limit: number;
  filters?: IContentFilters;
}

/**
 * Raw Content Item (before scoring)
 */
export interface IRawContentItem {
  _id: unknown;
  type: FeedItemType;
  content: unknown;
  createdAt: Date;
  authorId: string;
  reactionsCount: number;
  commentsCount: number;
  totalVotes?: number; // polls only
}
