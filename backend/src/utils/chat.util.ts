import sanitizeHtml from "sanitize-html";
import type { IChatMessageDocument } from "../models/ChatMessage.model.js";

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
 * 
 */
export const formatMessageResponse = (
  message: IChatMessageDocument,
) => {
  return {
    id: message._id,
    author: message.author,
    text: message.text,
    mentions: message.mentions,
    isEdited: message.isEdited,
    editedAt: message.editedAt,
    timestamp: formatChatTimestamp(message.createdAt),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
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
 * Remove HTML tags, excessive whitespace, and trim
 * Prevents XSS via chat messages
 */
export const sanitizeMessageText = (text?: string): string | undefined => {
  if (!text) return undefined;

  // Strip all HTML tags to prevent XSS
  const noHtml = sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Replace multiple spaces/newlines with single space
  const normalized = noHtml.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : undefined;
};
