/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { Follow } from "../models/Follow.model.js";
import { User } from "../models/User.model.js";
import type { GetFollowListQuerySchemaType } from "../schemas/follow.schema.js";
import {
  isFollowing,
  isMutualFollow,
  getFollowStats,
  getMutualFollowIds,
  updateFollowCounts,
} from "../utils/follow.util.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";

// =========================
// FOLLOW USER
// =========================
export const followUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { userId: targetUserId } = req.params as { userId: string };

    // Check if trying to follow self
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check if target user exists
    const targetUser = await User.findOne({ clerkId: targetUserId });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    const alreadyFollowing = await isFollowing(currentUserId, targetUserId);
    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Create follow relationship
    await Follow.create({
      userId: currentUserId,
      followingId: targetUserId,
    });

    // Update follow counts
    await updateFollowCounts(currentUserId, targetUserId, true);

    // Get current user for notification
    const currentUser = await User.findOne({ clerkId: currentUserId });

    // Create notification for target user
    await createNotification({
      userId: targetUserId,
      type: "follow",
      actorId: currentUserId,
      message: generateNotificationMessage("follow", currentUser?.username),
    });

    // Emit real-time event
    getSocketIO().emit("follow:new", {
      userId: currentUserId,
      followingId: targetUserId,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully followed user",
    });
  } catch (error: any) {
    console.error("Error following user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UNFOLLOW USER
// =========================
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { userId: targetUserId } = req.params as { userId: string };

    // Check if trying to unfollow self
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid operation",
      });
    }

    // Find and delete follow relationship
    const follow = await Follow.findOneAndDelete({
      userId: currentUserId,
      followingId: targetUserId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Update follow counts
    await updateFollowCounts(currentUserId, targetUserId, false);

    // Emit real-time event
    getSocketIO().emit("follow:removed", {
      userId: currentUserId,
      followingId: targetUserId,
    });

    return res.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET FOLLOWERS
// =========================
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId } = req.params as { userId: string };
    const query = req.query as unknown as GetFollowListQuerySchemaType;
    const { page, limit } = query;

    // Check if user exists
    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get followers
    const [follows, total] = await Promise.all([
      Follow.find({ followingId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ followingId: targetUserId }),
    ]);

    // Get user details for followers
    const followerIds = follows.map((f) => f.userId);
    const followers = await User.find({ clerkId: { $in: followerIds } });

    return res.json({
      success: true,
      data: followers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET FOLLOWING
// =========================
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId } = req.params as { userId: string };
    const query = req.query as unknown as GetFollowListQuerySchemaType;
    const { page, limit } = query;

    // Check if user exists
    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get following
    const [follows, total] = await Promise.all([
      Follow.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ userId: targetUserId }),
    ]);

    // Get user details for following
    const followingIds = follows.map((f) => f.followingId);
    const following = await User.find({ clerkId: { $in: followingIds } });

    return res.json({
      success: true,
      data: following,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching following:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// CHECK FOLLOWING STATUS
// =========================
export const checkFollowing = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { userId: targetUserId } = req.params as { userId: string };

    // Check if checking own profile
    if (currentUserId === targetUserId) {
      return res.json({
        success: true,
        data: {
          isFollowing: false,
          isFollowedBy: false,
          isMutual: false,
        },
      });
    }

    // Check follow status
    const [following, followedBy] = await Promise.all([
      isFollowing(currentUserId, targetUserId),
      isFollowing(targetUserId, currentUserId),
    ]);

    return res.json({
      success: true,
      data: {
        isFollowing: following,
        isFollowedBy: followedBy,
        isMutual: following && followedBy,
      },
    });
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET MUTUAL FOLLOWS
// =========================
export const getMutualFollows = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { userId: targetUserId } = req.params as { userId: string };

    // Check if checking own profile
    if (currentUserId === targetUserId) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get mutual follow IDs
    const mutualIds = await getMutualFollowIds(currentUserId, targetUserId);

    // Get user details
    const mutualUsers = await User.find({ clerkId: { $in: mutualIds } });

    return res.json({
      success: true,
      data: mutualUsers,
      count: mutualUsers.length,
    });
  } catch (error: any) {
    console.error("Error fetching mutual follows:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET FOLLOW STATS
// =========================
export const getFollowStatsController = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { userId: targetUserId } = req.params as { userId: string };

    // Get follow statistics
    const stats = await getFollowStats(targetUserId, currentUserId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching follow stats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
