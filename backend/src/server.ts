import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import userRoutes from "./routes/user.routes.js";
import webhookRoutes from "./routes/webhook.routes.js"; // 👈 add this
import { clerkMiddleware } from "@clerk/express";

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

// --- Simple test route ---
app.get("/", (_, res) => {
  res.send("Quad API is running 🚀");
});

// --- Initialize HTTP server and Socket.IO ---
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" },
});

// Optional: Socket.IO connection logging
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// --- Start server after DB connection ---
const startServer = async () => {
  await connectDB(); // ✅ Connect to MongoDB first
  server.listen(env.PORT, () => {
    console.log(`✅ Server running on port ${env.PORT}`);
  });
};

startServer();