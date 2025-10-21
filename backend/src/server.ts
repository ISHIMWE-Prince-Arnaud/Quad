import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db"; // Assuming this returns a Promise
import { configureCloudinary } from "./config/cloudinary";
import { initializeSocketHandlers } from "./sockets/socketHandler";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import pollRoutes from "./routes/pollRoutes";
import confessionRoutes from "./routes/confessionRoutes";
import chatRoutes from "./routes/chatRoutes";
import userRoutes from "./routes/userRoutes";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible in request handlers
app.set("io", io);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Cloudinary
configureCloudinary();

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Quad API Server is running 🚀" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Connect to database and WAIT for connection
    console.log("Attempting to connect to database...");
    await connectDB();
    console.log("✅ Database connected successfully.");

    // Start server only after DB connection is successful
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO server ready for connections\n`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database or start server:", error);
    // Optionally exit the process if DB connection is critical
    process.exit(1);
  }
};

// Process-level error handlers
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Log the error but don't exit in development
  if (process.env.NODE_ENV === 'production') {
    console.error('🛑 Shutting down server due to unhandled rejection...');
    // Gracefully shutdown
    httpServer.close(() => {
      process.exit(1);
    });
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('🛑 Shutting down server due to uncaught exception...');
  // Uncaught exceptions are serious - always exit
  httpServer.close(() => {
    process.exit(1);
  });
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// Graceful shutdown on SIGTERM (e.g., from Docker or PM2)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Execute the start server function
startServer();

// Export io for use in controllers
export { io };
