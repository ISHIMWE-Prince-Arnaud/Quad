import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { setSocketIO } from "./config/socket.config.js";
import { ensureIndexes } from "./utils/indexes.util.js";
import { startPollExpiryJob } from "./jobs/poll.cron.js";
import { logger } from "./utils/logger.util.js";
import { 
  generalRateLimiter, 
  searchRateLimiter, 
  uploadRateLimiter, 
  writeRateLimiter 
} from "./middlewares/rateLimiter.middleware.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
import { setupNotificationSocket } from "./sockets/notification.socket.js";
import { setupFeedSocket } from "./sockets/feed.socket.js";
import userRoutes from "./routes/user.routes.js";
import webhookRoutes from "./routes/webhook.routes.js"; 
import { clerkMiddleware } from "@clerk/express";
import postRoutes from "./routes/post.routes.js";
import storyRoutes from "./routes/story.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import followRoutes from "./routes/follow.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import searchRoutes from "./routes/search.routes.js";

// --- Initialize Express ---
const app = express();
app.use(cors());

// 
// because Clerk webhooks need raw body for signature verification
app.use("/api/webhooks", webhookRoutes);

// Parse JSON body for all other routes
app.use(express.json());

// 🔐 Clerk middleware
app.use(clerkMiddleware());

//routes with rate limiting
app.use("/api/", generalRateLimiter); // Apply general rate limiting to all API routes

app.use("/api/users", userRoutes);
app.use("/api/posts", writeRateLimiter, postRoutes);
app.use("/api/stories", writeRateLimiter, storyRoutes);
app.use("/api/polls", writeRateLimiter, pollRoutes);
app.use("/api/chat", writeRateLimiter, chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/follow", writeRateLimiter, followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/reactions", writeRateLimiter, reactionRoutes);
app.use("/api/comments", writeRateLimiter, commentRoutes);
app.use("/api/upload", uploadRateLimiter, uploadRoutes);
app.use("/api/search", searchRateLimiter, searchRoutes);

// --- Simple test route ---
app.get("/", (_, res) => {
  res.send("Quad API is running 🚀");
});

// --- Initialize HTTP server and Socket.IO ---
const server = createServer(app);
const io = new SocketIOServer(server, {
  // TODO: In production, replace "*" with specific frontend URL(s)
  // e.g., cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" }
  cors: { origin: "*" },
});

// Set the Socket.IO instance globally
setSocketIO(io);

// Setup chat socket handlers
setupChatSocket(io);

// Setup notification socket handlers
setupNotificationSocket(io);

// Setup feed socket handlers
setupFeedSocket(io);

// Socket.IO connection logging (development only)
io.on("connection", (socket) => {
  logger.socket("User connected", socket.id);
  socket.on("disconnect", () => {
    logger.socket("User disconnected", socket.id);
  });
});

// --- Start server after DB connection ---
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB first
    await ensureIndexes(); // Create database indexes
    startPollExpiryJob(); // Start poll expiry cron job
    server.listen(env.PORT, () => {
      logger.server(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer().catch(error => {
  logger.error("Unhandled error during startup", error);
  process.exit(1);
});