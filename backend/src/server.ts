import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.config.js";
import {
  corsOptions,
  getSocketCorsOptions,
  logCorsConfig,
} from "./config/cors.config.js";
import { connectDB } from "./config/db.config.js";
import { setSocketIO } from "./config/socket.config.js";
import { ensureIndexes } from "./utils/indexes.util.js";
import { startPollExpiryJob } from "./jobs/poll.cron.js";
import { startAnalyticsCronJob } from "./jobs/analytics.cron.js";
import { logger } from "./utils/logger.util.js";
import { setupChatSocket } from "./sockets/chat.socket.js";
import { setupNotificationSocket } from "./sockets/notification.socket.js";
import { setupFeedSocket } from "./sockets/feed.socket.js";
import webhookRoutes from "./routes/webhook.routes.js";
import healthRoutes from "./routes/health.routes.js";
import apiRouter from "./routes/index.js";
import { clerkMiddleware } from "@clerk/express";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

// --- Initialize Express ---
const app = express();

// Security Headers
app.use(helmet());

// Configure CORS (imported from cors.config.ts)
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger);

// Health check routes (no auth required, before body parsing)
app.use("/health", healthRoutes);

//
// because Clerk webhooks need raw body for signature verification
app.use("/api/webhooks", webhookRoutes);

// Parse JSON body for all other routes
app.use(express.json());

// 🔐 Clerk middleware
app.use(clerkMiddleware());

// Centralized API Routes
app.use("/api", apiRouter);

// --- Simple test route ---
app.get("/", (_, res) => {
  res.send("Quad API is running 🚀");
});

app.use(errorHandler);

// --- Initialize HTTP server and Socket.IO ---
const server = createServer(app);

// Configure Socket.IO with proper CORS (imported from cors.config.ts)
const io = new SocketIOServer(server, {
  cors: getSocketCorsOptions(),
  // Additional Socket.IO options for production
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
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
    startAnalyticsCronJob();
    logCorsConfig(); // Log CORS configuration
    server.listen(env.PORT, () => {
      logger.server(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  logger.error("Unhandled error during startup", error);
  process.exit(1);
});
