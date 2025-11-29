export type ChatMediaAspectRatio = "1:1" | "16:9" | "9:16";

export interface ChatMedia {
  url: string;
  type: "image" | "video";
  aspectRatio?: ChatMediaAspectRatio;
}

// Snapshot of the author embedded on each chat message
export interface ChatAuthor {
  clerkId: string;
  username: string;
  email: string;
  profileImage?: string;
  bio?: string;
}

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text?: string;
  media?: ChatMedia;
  mentions: string[];
  reactionsCount: number;
  isEdited: boolean;
  editedAt?: string | null;
  timestamp: string; // e.g. "Tue 2:13 PM"
  createdAt: string;
  updatedAt: string;
  // Emoji string for the current user's reaction on this message, if any
  userReaction?: string | null;
}

export interface ChatMessagesPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pagination: ChatMessagesPagination;
  message?: string;
}

export interface ChatSendMessageResponse {
  success: boolean;
  data?: ChatMessage;
  message?: string;
}

export interface ChatEditMessageResponse {
  success: boolean;
  data?: ChatMessage;
  message?: string;
}

export interface ChatDeleteMessageResponse {
  success: boolean;
  message?: string;
}

export interface ChatReactionData {
  emoji: string;
  reactionsCount: number;
}

export interface ChatAddReactionResponse {
  success: boolean;
  data?: ChatReactionData;
  message?: string;
}

export interface ChatRemoveReactionResponse {
  success: boolean;
  data?: { reactionsCount: number };
  message?: string;
}

export interface ChatMarkAsReadData {
  lastReadMessageId: string;
  readAt: string;
}

export interface ChatMarkAsReadResponse {
  success: boolean;
  data?: ChatMarkAsReadData;
  message?: string;
}
