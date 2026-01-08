/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import type {
  UpdateProfileSchemaType,
  PaginationQuerySchemaType,
} from "../schemas/profile.schema.js";
import {
  calculateProfileStats,
  formatProfileResponse,
} from "../utils/profile.util.js";
import { clerkClient } from "@clerk/express";
import { logger } from "../utils/logger.util.js";

// Helper to ensure a user exists in MongoDB based on Clerk user ID
const ensureUserByClerkId = async (clerkId: string | null) => {
  if (!clerkId) return null;

  // Try existing user first
  let user = await User.findOne({ clerkId });
  if (user) return user;

  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
    const fallbackUsername = email ? email.split("@")[0] : "Anonymous";

    user = await User.create({
      clerkId,
      username: clerkUser.username || fallbackUsername,
      email,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      profileImage: clerkUser.imageUrl || undefined,
    });

    return user;
  } catch (error) {
    logger.error("Failed to ensure user by Clerk ID", error);
    return null;
  }
};

// =========================
// GET USER PROFILE BY ID (Convenience endpoint)
// =========================
export const getProfileById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find or auto-create user by clerkId
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await ensureUserByClerkId(userId ?? null);
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate profile statistics
    const stats = await calculateProfileStats(user.clerkId);

    // Format and return profile response
    const profileData = formatProfileResponse(user, stats);

    return res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error: any) {
    logger.error("Error getting profile by ID", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// =========================
// GET USER PROFILE BY USERNAME
// =========================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    const currentUserId = req.auth?.userId ?? null;

    // Ensure current user exists in MongoDB based on Clerk ID
    if (currentUserId) {
      await ensureUserByClerkId(currentUserId);
    }

    // Find user by username (no auto-create by username)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is viewing their own profile
    const isOwnProfile = user.clerkId === currentUserId;

    // Calculate profile statistics
    const stats = await calculateProfileStats(user.clerkId);

    // Format response and include ownership flag separately
    const profile = formatProfileResponse(user, stats);

    return res.json({
      success: true,
      data: {
        ...profile,
        isOwnProfile,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching profile", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE OWN PROFILE
// =========================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    const currentUserId = req.auth.userId;
    const updates = req.body as UpdateProfileSchemaType;

    // Find the user to be updated
    const userToUpdate = await User.findOne({ username });
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify that user can only update their own profile
    if (userToUpdate.clerkId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile",
      });
    }

    // Update the user profile in MongoDB
    const user = await User.findOneAndUpdate(
      { clerkId: currentUserId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sync relevant fields back to Clerk so names/usernames stay consistent
    try {
      await clerkClient.users.updateUser(currentUserId, {
        firstName: updates.firstName ?? undefined,
        lastName: updates.lastName ?? undefined,
        username: updates.username ?? undefined,
        imageUrl:
          updates.profileImage === null
            ? null
            : updates.profileImage ?? undefined,
      } as any);
    } catch (clerkError) {
      logger.error("Failed to sync profile updates to Clerk", clerkError);
      // Do not fail the request just because Clerk sync failed
    }

    // Calculate profile statistics
    const stats = await calculateProfileStats(user.clerkId);

    // Format response
    const profile = formatProfileResponse(user, stats);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: any) {
    logger.error("Error updating profile", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S POSTS
// =========================
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;
    const currentUserId = req.auth?.userId ?? null;

    // Ensure current user exists in MongoDB based on Clerk ID
    if (currentUserId) {
      await ensureUserByClerkId(currentUserId);
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get user's posts
    const [posts, total] = await Promise.all([
      Post.find({ "author.clerkId": user.clerkId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ "author.clerkId": user.clerkId }),
    ]);

    return res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user posts", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S STORIES
// =========================
export const getUserStories = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;
    const currentUserId = req.auth?.userId ?? null;

    // Ensure current user exists in MongoDB based on Clerk ID
    if (currentUserId) {
      await ensureUserByClerkId(currentUserId);
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get user's stories
    const [stories, total] = await Promise.all([
      Story.find({ "author.clerkId": user.clerkId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Story.countDocuments({ "author.clerkId": user.clerkId }),
    ]);

    return res.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user stories", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S POLLS
// =========================
export const getUserPolls = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;
    const currentUserId = req.auth?.userId ?? null;

    // Ensure current user exists in MongoDB based on Clerk ID
    if (currentUserId) {
      await ensureUserByClerkId(currentUserId);
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get user's polls
    const [polls, total] = await Promise.all([
      Poll.find({ "author.clerkId": user.clerkId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Poll.countDocuments({ "author.clerkId": user.clerkId }),
    ]);

    return res.json({
      success: true,
      data: polls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user polls", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
