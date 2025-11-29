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
