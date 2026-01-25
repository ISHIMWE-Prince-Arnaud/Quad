import { Router } from "express";
import {
  generalRateLimiter,
  uploadRateLimiter,
  writeRateLimiter,
} from "../middlewares/rateLimiter.middleware.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import storyRoutes from "./story.routes.js";
import pollRoutes from "./poll.routes.js";
import chatRoutes from "./chat.routes.js";
import profileRoutes from "./profile.routes.js";
import followRoutes from "./follow.routes.js";
import notificationRoutes from "./notification.routes.js";
import feedRoutes from "./feed.routes.js";
import reactionRoutes from "./reaction.routes.js";
import commentRoutes from "./comment.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

// Apply general rate limiting to all API routes
router.use(generalRateLimiter);

router.use("/users", userRoutes);
router.use("/posts", writeRateLimiter, postRoutes);
router.use("/stories", writeRateLimiter, storyRoutes);
router.use("/polls", writeRateLimiter, pollRoutes);
router.use("/chat", writeRateLimiter, chatRoutes);
router.use("/profile", profileRoutes);
router.use("/follow", writeRateLimiter, followRoutes);
router.use("/notifications", notificationRoutes);
router.use("/feed", feedRoutes);
router.use("/reactions", writeRateLimiter, reactionRoutes);
router.use("/comments", writeRateLimiter, commentRoutes);
router.use("/bookmarks", writeRateLimiter, bookmarkRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/upload", uploadRateLimiter, uploadRoutes);

export default router;