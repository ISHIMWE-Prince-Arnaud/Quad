import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import confessionRoutes from "./routes/confessionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/confessions", confessionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Quad API is running" });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
