// ===========================
// SHARED PAGINATION TYPES
// ===========================
// These types match the backend Zod schemas in pagination.schema.ts

/**
 * Cursor-based pagination
 * Used for: feeds, infinite scroll, real-time data
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * Offset-based pagination
 * Used for: admin panels, search results, ordered lists
 */
export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Skip-based pagination
 * Used for: simple infinite scroll, offset without page concept
 */
export interface SkipPaginationParams {
  skip?: number;
  limit?: number;
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Common filter helpers
 */
export interface DateRangeParams {
  from?: string;
  to?: string;
}

export interface SearchQueryParams {
  q?: string;
}

// ===========================
// API-SPECIFIC EXTENDED TYPES
// ===========================

/**
 * Feed query parameters (cursor-based + filters)
 */
export interface FeedQueryParams extends CursorPaginationParams {
  tab?: "home" | "posts" | "polls";
  sort?: "newest" | "trending";
}

/**
 * Chat message query parameters (offset-based with 'before' filter)
 */
export interface ChatMessageQueryParams extends OffsetPaginationParams {
  before?: string; // MongoDB ObjectId for filtering older messages
}

/**
 * Poll query parameters (offset-based + filters)
 */
export interface PollQueryParams extends OffsetPaginationParams {
  status?: "active" | "expired" | "all";
  author?: string;
  voted?: boolean;
}

/**
 * Story query parameters (skip-based)
 */
export interface StoryQueryParams extends SkipPaginationParams {
  status?: "draft" | "published";
}

/**
 * Post query parameters (skip-based)
 */
export interface PostQueryParams extends SkipPaginationParams {
  // Add any post-specific filters here
}

/**
 * Comment query parameters (skip-based + content filters)
 */
export interface CommentQueryParams extends SkipPaginationParams {
  contentType?: "post" | "story";
  contentId?: string;
}

/**
 * Notification query parameters (offset-based + filters)
 */
export interface NotificationQueryParams extends OffsetPaginationParams {
  unreadOnly?: boolean;
}

/**
 * Bookmark query parameters (offset-based + filters)
 */
export interface BookmarkQueryParams extends OffsetPaginationParams {
  contentType?: "post" | "story" | "poll";
}

/**
 * Follow list query parameters (offset-based with higher limit)
 */
export interface FollowListQueryParams extends OffsetPaginationParams {
  // Follow lists allow up to 100 items per page
}
