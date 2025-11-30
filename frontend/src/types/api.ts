// API Response Types based on backend models

export interface ApiUser {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  isVerified?: boolean;
  joinedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface ApiProfile extends ApiUser {
  followers?: number;
  following?: number;
  postsCount?: number;
  storiesCount?: number;
  pollsCount?: number;
  isFollowing?: boolean;
  mutualFollows?: number;
}

export interface ApiPost {
  _id: string;
  userId?: string;
  clerkId?: string;
  text?: string;
  media?: {
    url: string;
    type: "image" | "video";
    aspectRatio?: "1:1" | "16:9" | "9:16";
  }[];
  reactionsCount?: number;
  commentsCount?: number;
  content?: string;
  images?: string[];
  videos?: string[];
  author: ApiUser;
  likes?: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  isShared?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotificationActor {
  clerkId: string;
  username: string;
  email?: string;
  displayName?: string;
  profileImage?: string;
}

export interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  actorId?: string;
  contentId?: string;
  contentType?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor?: ApiNotificationActor;
}

export interface ApiStory {
  _id: string;
  clerkId: string;
  content?: string;
  media: string;
  mediaType: "image" | "video";
  author: ApiUser;
  views: number;
  isViewed: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface ApiPoll {
  _id: string;
  clerkId: string;
  question: string;
  options: {
    option: string;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
  author: ApiUser;
  userVote?: string;
  expiresAt?: string;
  isExpired: boolean;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFollowUser {
  _id: string;
  clerkId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  bio?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  mutualFollows?: number;
  followedAt?: string;
}

export interface ApiFollowStats {
  followers: number;
  following: number;
  mutualFollows: number;
}

export interface ApiUploadResponse {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface ApiSearchResult<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Search params
export interface UserSearchParams extends PaginationParams {
  q: string;
  sortBy?: "relevance" | "date" | "followers";
  fuzzy?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// Follow list params
export interface FollowListParams extends PaginationParams {
  search?: string;
}

// Profile update data
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
}

// Content item for profile grid and services
export interface ContentItem {
  _id: string;
  type: "post" | "story" | "poll";
  author: ApiUser;
  createdAt: string;
  updatedAt?: string;
  // Human-readable content used by the UI (required)
  content: string;
  // Backend-aligned optional fields
  text?: string;
  media?: {
    url: string;
    type: "image" | "video";
    aspectRatio?: "1:1" | "16:9" | "9:16";
  }[];
  images?: string[];
  reactionsCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  totalVotes?: number;
  likes?: number;
  comments?: number;
  views?: number;
  isLiked?: boolean;
  title?: string;
  coverImage?: string;
  readTime?: number;
  question?: string;
}

// Global search result type
export interface GlobalSearchResult {
  users: ApiProfile[];
  posts: ApiPost[];
  stories: ApiStory[];
  polls: ApiPoll[];
  total: number;
}
