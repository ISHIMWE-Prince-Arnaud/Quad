import type { IChatMessageDocument } from "../models/ChatMessage.model.js";
import type { IMessageReactionDocument } from "../models/MessageReaction.model.js";

/**
 * Format timestamp as "Tue 2:13 PM", "Wed 10:00 AM"
 */
export const formatChatTimestamp = (date: Date): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[date.getDay()];

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();

  return `${dayName} ${hours}:${minutesStr} ${ampm}`;
};

/**
 * Extract mentioned usernames from text
 * Finds all @username patterns
 */
export const extractMentions = (text?: string): string[] => {
  if (!text) return [];

  // Match @username (alphanumeric and underscore)
  const mentionRegex = /@(\w+)/g;
  const matches = text.matchAll(mentionRegex);

  const mentions = Array.from(matches, (match) => match[1]).filter(
    (m): m is string => !!m
  );

  // Return unique mentions
  return [...new Set(mentions)];
};

/**
 * Format message for response
 * Includes user's reaction if they reacted
 */
export const formatMessageResponse = (
  message: IChatMessageDocument,
  userReaction?: IMessageReactionDocument,
  reactions?: Array<{ emoji: string; count: number }>
) => {
  return {
    id: message._id,
    author: message.author,
    text: message.text,
    mentions: message.mentions,
    reactionsCount: message.reactionsCount,
    reactions: reactions ?? [],
    isEdited: message.isEdited,
    editedAt: message.editedAt,
    timestamp: formatChatTimestamp(message.createdAt),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    userReaction: userReaction?.emoji,
  };
};

/**
 * Check if message has valid content
 */
export const hasValidContent = (text?: string, media?: unknown): boolean => {
  void media;
  return !!(text && text.trim().length > 0);
};

/**
 * Sanitize message text
 * Remove excessive whitespace and trim
 */
export const sanitizeMessageText = (text?: string): string | undefined => {
  if (!text) return undefined;

  // Replace multiple spaces/newlines with single space
  const next = text.replace(/\s+/g, " ").trim();
  return next.length > 0 ? next : undefined;
};
