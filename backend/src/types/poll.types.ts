import type { IUser } from "./user.types.js";
import type { IMedia } from "./post.types.js";

export type IPollMedia = Omit<IMedia, "type"> & { type: "image" };

/**
 * Poll Status
 * - active: Currently accepting votes
 * - expired: Expiration date passed (auto-updated by cron job)
 * - closed: Manually closed by author
 */
export type PollStatus = "active" | "expired" | "closed";

/**
 * Poll Option
 * Single option in a poll
 */
export interface IPollOption {
  text: string; // Option text (1-200 chars)
  votesCount: number; // Cached vote count
}

/**
 * Poll Settings
 * Configuration for poll behavior
 */
export interface IPollSettings {
  anonymousVoting: boolean; // Hide voter identities (votes remain anonymous)
}

/**
 * Poll Interface
 * Main poll object
 */
export interface IPoll {
  id: string;
  author: IUser; // Poll creator (embedded snapshot)

  // Content
  question: string; // Poll question (10-500 chars)
  questionMedia?: IPollMedia; // Optional media for question
  options: IPollOption[]; // 2-5 options

  // Settings
  settings: IPollSettings;

  // Status
  status: PollStatus; // active, expired, or closed
  expiresAt?: Date; // Optional expiration date

  // Engagement (cached counts)
  totalVotes: number; // Total number of votes
  reactionsCount: number; // Total reactions

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Poll Vote
 * Records a user's vote on a poll
 * Note: Voter information is private and never exposed via API
 */
export interface IPollVote {
  id: string;
  pollId: string; // Reference to poll
  userId: string; // Clerk user ID (private)
  optionIndices: number[]; // Selected option indices
  votedAt: Date;
}

/**
 * Create Poll DTO (Data Transfer Object)
 */
export interface ICreatePoll {
  question: string;
  questionMedia?: IPollMedia;
  options: Array<{
    text: string;
  }>;
  settings?: {
    anonymousVoting?: boolean;
  };
  expiresAt?: Date;
}

/**
 * Update Poll DTO
 * Limited updates allowed (question and media only, after votes cast)
 */
export interface IUpdatePoll {
  question?: string;
  questionMedia?: IPollMedia;
}

/**
 * Vote on Poll DTO
 */
export interface IVoteOnPoll {
  optionIndices: number[]; // Array of selected option indices
}

/**
 * Poll Results
 * Public poll results (respects privacy settings)
 */
export interface IPollResults {
  pollId: string;
  totalVotes: number;
  options: Array<{
    text: string;
    votesCount: number;
    percentage: number;
  }>;
  userVote?: number[]; // Current user's vote (if any)
  canViewResults: boolean; // Based on settings and user's vote status
}
