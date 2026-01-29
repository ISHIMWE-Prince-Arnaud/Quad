import type { ApiResponse } from "./api";

export type FeedType = "following" | "foryou";
export type FeedTab = "home" | "posts" | "polls" | "stories";
export type FeedSort = "newest" | "trending";

export type FeedItemType = "post" | "poll" | "story";

export interface FeedAuthor {
  clerkId: string;
  username: string;
  profileImage?: string;
}

export interface FeedEngagementMetrics {
  reactions: number;
  comments?: number;
  votes: number;
}

export interface FeedItem<TContent = unknown> {
  _id: string;
  type: FeedItemType;
  content: TContent;
  score: number;
  priority: "following" | "discover";
  createdAt: string | Date;
  engagementMetrics: FeedEngagementMetrics;
  author: FeedAuthor;
}

export interface FeedPagination {
  nextCursor?: string;
  hasMore: boolean;
  count: number;
}

export interface FeedMetadata {
  feedType: FeedType;
  tab: FeedTab;
  sort: FeedSort;
  totalAvailable?: number;
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: FeedPagination;
  metadata: FeedMetadata;
}

export type FeedApiResponse = ApiResponse<FeedResponse>;

export interface FeedQueryParams {
  tab?: FeedTab;
  cursor?: string;
  limit?: number;
  sort?: FeedSort;
}

export interface NewCountParams {
  feedType: FeedType;
  tab: FeedTab;
  since: string; // last seen content ID
}
