import type { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.util.js";

// Store typing users: Map<socketId, {userId, username}>
const typingUsers = new Map<string, { userId: string; username: string }>();

// Throttle map: socketId -> last typing emit timestamp
const lastTypingEmit = new Map<string, number>();
const TYPING_THROTTLE_MS = 2000;

/**
 * Setup chat socket event handlers
 * NOTE: This is intentionally a single global chat room ("chat:global").
 * All authenticated users share one chat space.
 */
export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const authenticatedUserId = socket.data.userId as string | undefined;
    if (!authenticatedUserId) return; // Should never happen (auth middleware rejects first)

    // Auto-join the global chat room
    socket.join("chat:global");
    logger.socket("User connected to chat", {
      socketId: socket.id,
      userId: authenticatedUserId,
    });

    // ===========================
    // TYPING INDICATORS
    // ===========================

    /**
     * User starts typing
     * Client sends: { username: string }
     * userId is sourced from the authenticated socket, not from client data.
     */
    socket.on("chat:typing:start", (data: { username: string }) => {
      // Throttle: ignore rapid typing events (max 1 per 2s)
      const now = Date.now();
      const lastEmit = lastTypingEmit.get(socket.id) || 0;
      if (now - lastEmit < TYPING_THROTTLE_MS) return;
      lastTypingEmit.set(socket.id, now);

      const userId = authenticatedUserId;

      // Store typing user
      typingUsers.set(socket.id, {
        userId,
        username: data.username,
      });

      // Broadcast to the chat room only (not globally)
      socket.to("chat:global").emit("chat:typing:start", {
        userId,
        username: data.username,
      });

      logger.socket("User is typing", { username: data.username, userId });
    });

    /**
     * User stops typing
     */
    socket.on("chat:typing:stop", () => {
      const typingUser = typingUsers.get(socket.id);
      typingUsers.delete(socket.id);
      lastTypingEmit.delete(socket.id);

      if (typingUser) {
        socket.to("chat:global").emit("chat:typing:stop", {
          userId: typingUser.userId,
        });

        logger.socket("User stopped typing", {
          username: typingUser.username,
          userId: typingUser.userId,
        });
      }
    });

    // ===========================
    // DISCONNECT
    // ===========================

    socket.on("disconnect", () => {
      // Clean up typing indicator if user was typing
      const typingUser = typingUsers.get(socket.id);
      if (typingUser) {
        socket.to("chat:global").emit("chat:typing:stop", {
          userId: typingUser.userId,
        });
        typingUsers.delete(socket.id);
        logger.socket("User disconnected while typing", {
          username: typingUser.username,
          userId: typingUser.userId,
        });
      }

      lastTypingEmit.delete(socket.id);
      logger.socket("User disconnected from chat", { socketId: socket.id });
    });
  });
};

/**
 * Get current typing users (for debugging)
 */
export const getTypingUsers = () => {
  return Array.from(typingUsers.values());
};
