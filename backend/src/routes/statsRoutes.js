import express from "express";
import Post from "../models/Post.js";
import { getIO } from "../config/socket.js";

const router = express.Router();

// Helper function to get connected users count
const getConnectedUsersCount = () => {
  const io = getIO();
  return io ? Object.keys(io.sockets.sockets).length : 0;
};

// Get community stats
router.get("/community", async (req, res) => {
  try {
    const activeUsers = getConnectedUsersCount();
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const totalReactions = await Post.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: [
                "$reactions.laugh",
                "$reactions.cry",
                "$reactions.love",
                "$reactions.angry",
              ],
            },
          },
        },
      },
    ]);

    res.json({
      activeUsers,
      postsToday,
      totalReactions: totalReactions[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error getting community stats:", error);
    res.status(500).json({ message: "Failed to get community stats" });
  }
});

// Get trending tags
router.get("/trending-tags", async (req, res) => {
  try {
    const trendingTags = await Post.aggregate([
      // Unwind tags array
      { $unwind: "$tags" },
      // Group by tag and count occurrences
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      // Sort by count in descending order
      { $sort: { count: -1 } },
      // Limit to top 8 tags
      { $limit: 8 },
      // Project final format
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ]);

    res.json(trendingTags);
  } catch (error) {
    console.error("Error getting trending tags:", error);
    res.status(500).json({ message: "Failed to get trending tags" });
  }
});

export default router;
