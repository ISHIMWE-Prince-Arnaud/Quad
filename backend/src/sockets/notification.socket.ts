import type { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.util.js";

/**
 * Setup notification socket handlers
 */
export const setupNotificationSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // Join user's personal notification room
    socket.on("notification:join", (userId: string) => {
      if (userId) {
        socket.join(userId);
        logger.socket("User joined notification room", { userId });
      }
    });

    // Leave user's personal notification room
    socket.on("notification:leave", (userId: string) => {
      if (userId) {
        socket.leave(userId);
        logger.socket("User left notification room", { userId });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Socket.IO automatically removes socket from all rooms on disconnect
    });
  });
};
