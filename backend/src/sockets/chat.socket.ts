import type { Server, Socket } from "socket.io";

// Store typing users: Map<socketId, {userId, username}>
const typingUsers = new Map<string, { userId: string; username: string }>();

/**
 * Setup chat socket event handlers
 */
export const setupChatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🔌 User connected to chat:", socket.id);

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

      console.log(`⌨️  ${data.username} is typing...`);
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

        console.log(`⌨️  ${typingUser.username} stopped typing`);
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
        console.log(`⌨️  ${typingUser.username} disconnected while typing`);
      }

      console.log("🔌 User disconnected from chat:", socket.id);
    });
  });
};

/**
 * Get current typing users (for debugging)
 */
export const getTypingUsers = () => {
  return Array.from(typingUsers.values());
};
