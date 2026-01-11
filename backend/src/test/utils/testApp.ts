import express from "express";

import webhookRoutes from "../../routes/webhook.routes.js";
import userRoutes from "../../routes/user.routes.js";
import postRoutes from "../../routes/post.routes.js";
import storyRoutes from "../../routes/story.routes.js";
import pollRoutes from "../../routes/poll.routes.js";
import chatRoutes from "../../routes/chat.routes.js";
import profileRoutes from "../../routes/profile.routes.js";
import followRoutes from "../../routes/follow.routes.js";
import notificationRoutes from "../../routes/notification.routes.js";
import feedRoutes from "../../routes/feed.routes.js";
import reactionRoutes from "../../routes/reaction.routes.js";
import commentRoutes from "../../routes/comment.routes.js";
import uploadRoutes from "../../routes/upload.routes.js";
import searchRoutes from "../../routes/search.routes.js";
import bookmarkRoutes from "../../routes/bookmark.routes.js";
import analyticsRoutes from "../../routes/analytics.routes.js";

export const createTestApp = () => {
  const app = express();

  app.use("/api/webhooks", webhookRoutes);
  app.use(express.json());

  app.use((req, _res, next) => {
    const headerUserId = req.header("x-test-user-id");
    (req as any).auth = headerUserId ? { userId: headerUserId } : undefined;
    next();
  });

  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/stories", storyRoutes);
  app.use("/api/polls", pollRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/follow", followRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/reactions", reactionRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/bookmarks", bookmarkRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/search", searchRoutes);

  return app;
};
