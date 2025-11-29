import { io, Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
// Backend Socket.IO server is at the API origin without the /api suffix
const SOCKET_URL = API_BASE_URL.replace(/\/_?api\/?$/, "");

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type FeedNewContentPayload = {
  contentType: "post" | "story" | "poll";
  contentId: string;
  authorId: string;
  timestamp: string | number;
};

export type FeedEngagementUpdatePayload = {
  contentType: "post" | "story" | "poll";
  contentId: string;
  reactionsCount?: number;
  commentsCount?: number;
  votes?: number;
  timestamp: string | number;
};

export type FeedContentDeletedPayload = {
  contentType: "post" | "story" | "poll";
  contentId: string;
  timestamp: string | number;
};

// Chat payloads

export type ChatMediaAspectRatio = "1:1" | "16:9" | "9:16";

export type ChatMedia = {
  url: string;
  type: "image" | "video";
  aspectRatio?: ChatMediaAspectRatio;
};

export type ChatMessagePayload = {
  id: string;
  author: {
    clerkId: string;
    username: string;
    email: string;
    profileImage?: string;
    bio?: string;
  };
  text?: string;
  media?: ChatMedia;
  mentions: string[];
  reactionsCount: number;
  isEdited: boolean;
  editedAt?: string | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  userReaction?: string | null;
};

export type ChatReactionAddedPayload = {
  messageId: string;
  emoji: string;
  reactionsCount: number;
};

export type ChatReactionRemovedPayload = {
  messageId: string;
  reactionsCount: number;
};

export type ChatTypingStartPayload = {
  userId: string;
  username: string;
};

export type ChatTypingStopPayload = {
  userId: string;
};
