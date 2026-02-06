export type StoryStatus = "draft" | "published";

export interface StoryAuthor {
  clerkId: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
}

export interface Story {
  _id: string;
  author: StoryAuthor;
  title: string;
  content: string; // sanitized HTML
  coverImage?: string;
  status: StoryStatus;
  tags?: string[];
  readTime?: number;
  reactionsCount?: number;
  commentsCount?: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoriesListPagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface StoriesListResponse {
  success: boolean;
  data: Story[];
  pagination: StoriesListPagination;
  message?: string;
}

export interface StoryResponse {
  success: boolean;
  data?: Story;
  message?: string;
}

export interface CreateStoryInput {
  title: string;
  content: string;
  coverImage?: string;
  status?: StoryStatus; // default draft
  tags?: string[];
}

export interface UpdateStoryInput {
  title?: string;
  content?: string;
  coverImage?: string | null; // null to remove
  status?: StoryStatus;
  tags?: string[];
}
