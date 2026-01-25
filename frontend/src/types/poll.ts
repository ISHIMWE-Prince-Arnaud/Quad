import type { ApiUser } from "./api";

export type PollStatus = "active" | "expired" | "closed";

export type ResultsVisibility = "always" | "afterVote" | "afterExpiry";

export type PollMediaAspectRatio = "1:1" | "16:9" | "9:16";

export type PollMediaType = "image" | "video";

export interface PollMedia {
  url: string;
  type: PollMediaType;
  aspectRatio?: PollMediaAspectRatio;
}

export interface PollOption {
  index: number;
  text: string;
  media?: PollMedia;
  votesCount?: number;
  percentage?: number;
}

export interface PollSettings {
  allowMultiple: boolean;
  anonymousVoting: boolean;
  showResults: ResultsVisibility;
}

export type PollAuthor = ApiUser;

export interface Poll {
  id: string;
  author: PollAuthor;
  question: string;
  questionMedia?: PollMedia;
  options: PollOption[];
  settings: PollSettings;
  status: PollStatus;
  expiresAt?: string | null;
  totalVotes: number;
  reactionsCount: number;
  commentsCount: number;
  userVote?: number[];
  canViewResults: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PollsListPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface PollsListResponse {
  success: boolean;
  data: Poll[];
  pagination: PollsListPagination;
  message?: string;
}

export interface PollResponse {
  success: boolean;
  data?: Poll;
  message?: string;
}

export interface CreatePollOptionInput {
  text: string;
  media?: PollMedia;
}

export interface CreatePollInput {
  question: string;
  questionMedia?: PollMedia;
  options: CreatePollOptionInput[];
  settings?: {
    allowMultiple?: boolean;
    anonymousVoting?: boolean;
    showResults?: ResultsVisibility;
  };
  expiresAt?: string; // ISO string
}

export interface UpdatePollInput {
  question?: string;
  questionMedia?: PollMedia;
}

export interface VoteOnPollInput {
  optionIndices: number[];
}

export interface PollQueryParams {
  page?: number | string;
  limit?: number | string;
  status?: PollStatus | "all";
  author?: string;
  voted?: boolean;
  sort?: "newest" | "oldest" | "trending" | "mostVotes";
}
