import type { IPollDocument } from "../models/Poll.model.js";
import type { IPollVoteDocument } from "../models/PollVote.model.js";

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
  // Can't vote if closed
  if (poll.status === "closed") return false;
  
  // Can't vote if expired
  if (poll.status === "expired") return false;
  
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
  hasUserVoted: boolean
): boolean => {
  const { showResults } = poll.settings;
  
  switch (showResults) {
    case "always":
      // Always visible
      return true;
    
    case "afterVote":
      // Visible only after user votes
      return hasUserVoted;
    
    case "afterExpiry":
      // Visible only after poll expires or closes
      return poll.status === "expired" || poll.status === "closed";
    
    default:
      return false;
  }
};

/**
 * Calculate vote percentages for each option
 */
export const calculateVotePercentages = (
  poll: IPollDocument
): Array<{ text: string; votesCount: number; percentage: number }> => {
  const total = poll.totalVotes;
  
  return poll.options.map(option => ({
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
  optionIndices: number[]
): { valid: boolean; error?: string } => {
  // Check if indices are within range
  const maxIndex = poll.options.length - 1;
  const invalidIndices = optionIndices.filter(idx => idx < 0 || idx > maxIndex);
  
  if (invalidIndices.length > 0) {
    return {
      valid: false,
      error: `Invalid option indices: ${invalidIndices.join(", ")}. Poll has ${poll.options.length} options (0-${maxIndex})`
    };
  }
  
  // Check if multiple selection is allowed
  if (optionIndices.length > 1 && !poll.settings.allowMultiple) {
    return {
      valid: false,
      error: "This poll does not allow multiple selections"
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
  showResults: boolean = false
) => {
  const settings = {
    ...poll.settings,
    anonymousVoting: poll.settings?.anonymousVoting ?? false,
  };

  const response: Record<string, unknown> = {
    id: poll._id,
    author: poll.author,
    question: poll.question,
    questionMedia: poll.questionMedia,
    settings,
    status: poll.status,
    expiresAt: poll.expiresAt,
    totalVotes: poll.totalVotes,
    reactionsCount: poll.reactionsCount,
    commentsCount: poll.commentsCount,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
  };
  
  // Add options with or without vote counts
  if (showResults) {
    response.options = poll.options.map((opt, index) => ({
      index,
      text: opt.text,
      media: opt.media,
      votesCount: opt.votesCount,
      percentage: poll.totalVotes > 0 
        ? Math.round((opt.votesCount / poll.totalVotes) * 100) 
        : 0,
    }));
  } else {
    // Don't show vote counts
    response.options = poll.options.map((opt, index) => ({
      index,
      text: opt.text,
      media: opt.media,
    }));
  }
  
  // Add user's vote if they voted
  if (userVote) {
    response.userVote = userVote.optionIndices;
  }
  
  // Add result visibility status
  response.canViewResults = showResults;
  
  return response;
};
