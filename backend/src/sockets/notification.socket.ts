import type { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.util.js";
import { getUnreadCount } from "../utils/notification.util.js";

/**
 * Get the namespaced notification room name for a given userId.
 * Exported so that notification.util.ts uses the same prefix.
 */
export const getNotificationRoom = (userId: string) => `notification:${userId}`;

/**
 * Setup notification socket handlers
 */
export const setupNotificationSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const authenticatedUserId = socket.data.userId as string | undefined;

    // Join user's personal notification room (validated against auth)
    socket.on("notification:join", async (userId: string) => {
      if (!userId || userId !== authenticatedUserId) {
        logger.warn("Notification room join rejected: userId mismatch", {
          requested: userId,
          authenticated: authenticatedUserId,
        });
        return;
      }

      const room = getNotificationRoom(userId);
      socket.join(room);
      logger.socket("User joined notification room", { userId, room });

      try {
        const unreadCount = await getUnreadCount(userId);
        socket.emit("notification:unread_count", { unreadCount });
      } catch {
        // Ignore unread count errors for socket join; client can reconcile via REST
      }
    });

    // Leave user's personal notification room
    socket.on("notification:leave", (userId: string) => {
      if (!userId || userId !== authenticatedUserId) return;

      const room = getNotificationRoom(userId);
      socket.leave(room);
      logger.socket("User left notification room", { userId, room });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Socket.IO automatically removes socket from all rooms on disconnect
    });
  });
};
