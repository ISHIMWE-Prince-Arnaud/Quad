import type { Server, Socket } from "socket.io";
import type { FeedItemType } from "../types/feed.types.js";
import { logger } from "../utils/logger.util.js";

/**
 * Emit new content event
 */
export const emitNewContent = (
  io: Server,
  contentType: FeedItemType,
  contentId: string,
  authorId: string,
) => {
  io.emit("feed:new-content", {
    contentType,
    contentId,
    authorId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit engagement update event
 */
export const emitEngagementUpdate = (
  io: Server,
  contentType: FeedItemType,
  contentId: string,
  reactionsCount: number,
  commentsCount?: number,
  votes?: number,
) => {
  io.emit("feed:engagement-update", {
    contentType,
    contentId,
    reactionsCount,
    ...(commentsCount !== undefined && { commentsCount }),
    ...(votes !== undefined && { votes }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit content deleted event
 */
export const emitContentDeleted = (
  io: Server,
  contentType: FeedItemType,
  contentId: string,
) => {
  io.emit("feed:content-deleted", {
    contentType,
    contentId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Setup feed socket handlers
 */
export const setupFeedSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // Join user's personal feed room (only allow joining own room)
    socket.on("feed:join", (userId: string) => {
      const authenticatedUserId = socket.data.userId as string | undefined;
      if (!userId || userId !== authenticatedUserId) {
        logger.warn("Feed room join rejected: userId mismatch", {
          requested: userId,
          authenticated: authenticatedUserId,
        });
        return;
      }
      socket.join(`feed:${userId}`);
      logger.socket("User joined feed room", { userId });
    });

    // Leave user's personal feed room
    socket.on("feed:leave", (userId: string) => {
      if (userId) {
        socket.leave(`feed:${userId}`);
        logger.socket("User left feed room", { userId });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Socket.IO automatically removes socket from all rooms on disconnect
    });
  });
};
