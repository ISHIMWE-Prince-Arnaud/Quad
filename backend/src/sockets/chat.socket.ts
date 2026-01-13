import type { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.util.js";

// Store typing users: Map<socketId, {userId, username}>
const typingUsers = new Map<string, { userId: string; username: string }>();

/**
 * Setup chat socket event handlers
 */
export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    logger.socket("User connected to chat", { socketId: socket.id });

    // ===========================
    // TYPING INDICATORS
    // ===========================

    /**
     * User starts typing
     * Client sends: { userId: string, username: string }
     */
    socket.on("chat:typing:start", (data: { userId: string; username: string }) => {
      // Store typing user
      typingUsers.set(socket.id, {
        userId: data.userId,
        username: data.username,
      });

      // Broadcast to all other users
      socket.broadcast.emit("chat:typing:start", {
        userId: data.userId,
        username: data.username,
      });

      logger.socket("User is typing", { username: data.username, userId: data.userId });
    });

    /**
     * User stops typing
     * Client sends: { userId: string }
     */
    socket.on("chat:typing:stop", (data: { userId: string }) => {
      // Remove from typing users
      const typingUser = typingUsers.get(socket.id);
      typingUsers.delete(socket.id);

      // Broadcast to all other users
      if (typingUser) {
        socket.broadcast.emit("chat:typing:stop", {
          userId: data.userId,
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
        socket.broadcast.emit("chat:typing:stop", {
          userId: typingUser.userId,
        });
        typingUsers.delete(socket.id);
        logger.socket("User disconnected while typing", {
          username: typingUser.username,
          userId: typingUser.userId,
        });
      }

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
