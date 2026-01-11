/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import type {
  UpdateProfileSchemaType,
  PaginationQuerySchemaType,
} from "../schemas/profile.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { ProfileService } from "../services/profile.service.js";

// =========================
// GET USER PROFILE BY ID (Convenience endpoint)
// =========================
export const getProfileById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.auth?.userId ?? null;

  const profileData = await ProfileService.getProfileById(userId, currentUserId);

  return res.status(200).json({
    success: true,
    data: profileData,
  });
});

// =========================
// GET USER PROFILE BY USERNAME
// =========================
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const currentUserId = req.auth?.userId ?? null;
  const { profile, isOwnProfile } = await ProfileService.getProfileByUsername(
    username,
    currentUserId
  );

  return res.json({
    success: true,
    data: {
      ...profile,
      isOwnProfile,
    },
  });
});

// =========================
// UPDATE OWN PROFILE
// =========================
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const currentUserId = req.auth?.userId;
  if (!currentUserId) {
    throw new AppError("Unauthorized", 401);
  }

  const updates = req.body as UpdateProfileSchemaType;
  const profile = await ProfileService.updateProfile(username, currentUserId, updates);

  return res.json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
});

// =========================
// GET USER'S POSTS
// =========================
export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const query = req.query as unknown as PaginationQuerySchemaType;
  const currentUserId = req.auth?.userId ?? null;

  const result = await ProfileService.getUserPosts(username, currentUserId, query);

  return res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

// =========================
// GET USER'S STORIES
// =========================
export const getUserStories = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const query = req.query as unknown as PaginationQuerySchemaType;
  const currentUserId = req.auth?.userId ?? null;

  const result = await ProfileService.getUserStories(username, currentUserId, query);

  return res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

// =========================
// GET USER'S POLLS
// =========================
export const getUserPolls = asyncHandler(async (req: Request, res: Response) => {
  const username = req.params.username;
  if (!username) {
    throw new AppError("Username is required", 400);
  }

  const query = req.query as unknown as PaginationQuerySchemaType;
  const currentUserId = req.auth?.userId ?? null;

  const result = await ProfileService.getUserPolls(username, currentUserId, query);

  return res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});
