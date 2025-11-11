import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { setSocketIO } from "./config/socket.config.js";
import { ensureIndexes } from "./utils/indexes.util.js";
import { startPollExpiryJob } from "./jobs/poll.cron.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
import { setupNotificationSocket } from "./sockets/notification.socket.js";
import userRoutes from "./routes/user.routes.js";
import webhookRoutes from "./routes/webhook.routes.js"; // 👈 add this
import { clerkMiddleware } from "@clerk/express";
import postRoutes from "./routes/post.routes.js";
import storyRoutes from "./routes/story.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import followRoutes from "./routes/follow.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

// --- Initialize Express ---
const app = express();
app.use(cors());

// ⚠️ Important: Register webhooks BEFORE express.json()
// because Clerk webhooks need raw body for signature verification
app.use("/api/webhooks", webhookRoutes);

// Parse JSON body for all other routes
app.use(express.json());

// 🔐 Clerk middleware
app.use(clerkMiddleware());

//routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);

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

// Optional: Socket.IO connection logging
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// --- Start server after DB connection ---
const startServer = async () => {
  try {
    await connectDB(); // ✅ Connect to MongoDB first
    await ensureIndexes(); // ✅ Create database indexes
    startPollExpiryJob(); // ✅ Start poll expiry cron job
    server.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer().catch(error => {
  console.error("❌ Unhandled error during startup:", error);
  process.exit(1);
});