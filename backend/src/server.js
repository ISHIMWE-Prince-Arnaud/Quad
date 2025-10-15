import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import cron from "node-cron";
import Post from "./models/Post.js";
import User from "./models/User.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "⚠️  Warning: Cloudinary credentials not configured. File uploads will fail."
  );
}

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} (${
          process.env.NODE_ENV || "development"
        })`
      );
      // Initialize Socket.IO
      initSocket(server);
    });

    // 🕓 Weekly Cron Job
    cron.schedule("0 0 * * 1", async () => {
      try {
        console.log("🔄 Running weekly top posts update...");
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        await Post.updateMany({}, { isTopPost: false });

        const topPosts = await Post.aggregate([
          { $match: { createdAt: { $gte: oneWeekAgo }, isFlagged: false } },
          {
            $addFields: {
              totalReactions: {
                $add: [
                  "$reactions.laugh",
                  "$reactions.cry",
                  "$reactions.love",
                  "$reactions.angry",
                ],
              },
            },
          },
          { $sort: { totalReactions: -1 } },
          { $limit: 10 },
        ]);

        const topPostIds = topPosts.map((p) => p._id);
        await Post.updateMany(
          { _id: { $in: topPostIds } },
          { isTopPost: true }
        );

        for (const post of topPosts.slice(0, 3)) {
          await User.findByIdAndUpdate(post.userId, {
            $addToSet: { badges: "TopPost" },
          });
        }

        const activeUsers = await Post.aggregate([
          { $match: { createdAt: { $gte: oneWeekAgo } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
          { $match: { count: { $gte: 10 } } },
        ]);

        for (const user of activeUsers) {
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { badges: "ActiveUser" },
          });
        }

        console.log("✅ Weekly update completed!");
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] ❌ Error in cron job:`,
          error
        );
      }
    });

    process.on("unhandledRejection", (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error("❌ Could not start server:", error);
    process.exit(1);
  }
};

startServer();
