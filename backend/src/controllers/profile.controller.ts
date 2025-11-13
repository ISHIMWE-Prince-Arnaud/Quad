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

// =========================
// GET USER PROFILE BY ID (Convenience endpoint)
// =========================
export const getProfileById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
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
    console.error("Error getting profile by ID:", error);
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
    const { username } = req.params;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate profile statistics
    const stats = await calculateProfileStats(user.clerkId);

    // Format response
    const profile = formatProfileResponse(user, stats);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET OWN PROFILE
// =========================
export const getOwnProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;

    // Find current user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate profile statistics
    const stats = await calculateProfileStats(user.clerkId);

    // Format response
    const profile = formatProfileResponse(user, stats);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("Error fetching own profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE OWN PROFILE
// =========================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const updates = req.body as UpdateProfileSchemaType;

    // Find and update user
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
    console.error("Error updating profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S POSTS
// =========================
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;

    // Find user
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
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S STORIES
// =========================
export const getUserStories = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;

    // Find user
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
    console.error("Error fetching user stories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S POLLS
// =========================
export const getUserPolls = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const query = req.query as unknown as PaginationQuerySchemaType;
    const { page, limit } = query;

    // Find user
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
    console.error("Error fetching user polls:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
