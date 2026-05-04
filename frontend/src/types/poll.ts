import type { ApiUser } from "./api";
import type { PollQueryParams as SharedPollQueryParams } from "@/lib/api/paginationTypes";

export type PollStatus = "active" | "expired";

export type PollMediaAspectRatio = "1:1" | "16:9" | "9:16";

export type PollMediaType = "image";

export interface PollMedia {
  url: string;
  type: PollMediaType;
  aspectRatio?: PollMediaAspectRatio;
}

export interface PollOption {
  index: number;
  text: string;
  votesCount?: number;
  percentage?: number;
}

export interface PollSettings {
  anonymousVoting: boolean;
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
}

export interface CreatePollInput {
  question: string;
  questionMedia?: PollMedia;
  options: CreatePollOptionInput[];
  settings?: {
    anonymousVoting?: boolean;
  };
  expiresAt?: string; // ISO string
}

export interface UpdatePollInput {
  question?: string;
  questionMedia?: PollMedia | null;
  options?: CreatePollOptionInput[];
  settings?: {
    anonymousVoting?: boolean;
  };
  expiresAt?: string | null;
}

export interface VoteOnPollInput {
  optionIndices: number[];
}

// Re-export from shared pagination types for consistency
export type PollQueryParams = SharedPollQueryParams;
