import type { IPollDocument } from "../models/Poll.model.js";
import type { IPollVoteDocument } from "../models/PollVote.model.js";
import type { IPollResponse } from "../types/poll.types.js";

/**
 * Check if a poll is expired
 */
export const isPollExpired = (poll: IPollDocument): boolean => {
  if (!poll.expiresAt) return false;
  return new Date() > poll.expiresAt;
};

/**
 * Check if a poll is still accepting votes
 */
export const canVoteOnPoll = (poll: IPollDocument): boolean => {
  // Can't vote unless active
  if (poll.status !== "active") return false;

  // Can't vote if expiration date passed (even if status not updated yet)
  if (isPollExpired(poll)) return false;

  return true;
};

/**
 * Check if user can see poll results
 * Based on poll settings and user's voting status
 */
export const canViewResults = (
  poll: IPollDocument,
  hasUserVoted: boolean,
): boolean => {
  void poll;
  return hasUserVoted;
};

/**
 * Calculate vote percentages for each option
 */
export const calculateVotePercentages = (
  poll: IPollDocument,
): Array<{ text: string; votesCount: number; percentage: number }> => {
  const total = poll.totalVotes;

  return poll.options.map((option) => ({
    text: option.text,
    votesCount: option.votesCount,
    percentage: total > 0 ? Math.round((option.votesCount / total) * 100) : 0,
  }));
};

/**
 * Validate vote option indices against poll options
 */
export const validateVoteIndices = (
  poll: IPollDocument,
  optionIndices: number[],
): { valid: boolean; error?: string } => {
  if (optionIndices.length !== 1) {
    return {
      valid: false,
      error: "Must select exactly one option",
    };
  }

  // Check if indices are within range
  const maxIndex = poll.options.length - 1;
  const invalidIndices = optionIndices.filter(
    (idx) => idx < 0 || idx > maxIndex,
  );

  if (invalidIndices.length > 0) {
    return {
      valid: false,
      error: `Invalid option indices: ${invalidIndices.join(", ")}. Poll has ${poll.options.length} options (0-${maxIndex})`,
    };
  }

  return { valid: true };
};

/**
 * Get quick expiry dates
 * Helper for frontend to offer common expiry options
 */
export const getQuickExpiryDates = () => {
  const now = new Date();

  return {
    oneHour: new Date(now.getTime() + 60 * 60 * 1000),
    sixHours: new Date(now.getTime() + 6 * 60 * 60 * 1000),
    oneDay: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    threeDays: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    oneWeek: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
};

/**
 * Format poll for public response
 * Removes sensitive data and formats results based on permissions
 */
export const formatPollResponse = (
  poll: IPollDocument,
  userVote?: IPollVoteDocument,
  showResults: boolean = false,
): IPollResponse => {
  const settings = {
    ...poll.settings,
    anonymousVoting: poll.settings?.anonymousVoting ?? false,
  };

  const statusRaw = poll.status as unknown as string;
  const status = statusRaw === "closed" ? "expired" : poll.status;

  const response: IPollResponse = {
    id: String(poll._id),
    author: poll.author as unknown as IPollResponse["author"],
    question: poll.question,
    ...(poll.questionMedia !== undefined
      ? { questionMedia: poll.questionMedia }
      : {}),
    settings: settings as unknown as IPollResponse["settings"],
    status: status as unknown as IPollResponse["status"],
    ...(poll.expiresAt !== undefined ? { expiresAt: poll.expiresAt } : {}),
    totalVotes: poll.totalVotes,
    reactionsCount: poll.reactionsCount,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
    options: [],
    ...(userVote ? { userVote: userVote.optionIndices } : {}),
    canViewResults: showResults,
  };

  // Add options with or without vote counts
  if (showResults) {
    response.options = poll.options.map((opt, index) => ({
      index,
      text: opt.text,
      votesCount: opt.votesCount,
      percentage:
        poll.totalVotes > 0
          ? Math.round((opt.votesCount / poll.totalVotes) * 100)
          : 0,
    }));
  } else {
    // Don't show vote counts
    response.options = poll.options.map((opt, index) => ({
      index,
      text: opt.text,
    }));
  }

  return response;
};
