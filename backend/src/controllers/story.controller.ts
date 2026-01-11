/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import type {
  CreateStorySchemaType,
  UpdateStorySchemaType,
  GetStoriesQuerySchemaType,
} from "../schemas/story.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { StoryService } from "../services/story.service.js";

// =========================
// CREATE STORY
// =========================
export const createStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const storyData = req.body as CreateStorySchemaType;
  const newStory = await StoryService.createStory(userId, storyData);

  return res.status(201).json({
    success: true,
    message: newStory.status === "draft" ? "Draft saved" : "Story published",
    data: newStory,
  });
});

// =========================
// GET ALL STORIES
// =========================
export const getAllStories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  const query = req.query as unknown as GetStoriesQuerySchemaType;

  const result = await StoryService.getAllStories(userId, query);

  return res.status(200).json({
    success: true,
    data: result.stories,
    pagination: result.pagination,
  });
});

// =========================
// GET SINGLE STORY
// =========================
export const getStory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Story ID is required", 400);
  }

  const userId = req.auth?.userId;
  const story = await StoryService.getStory(id, userId);

  return res.status(200).json({ success: true, data: story });
});

// =========================
// UPDATE STORY
// =========================
export const updateStory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Story ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const inputUpdates = req.body as UpdateStorySchemaType;
  const story = await StoryService.updateStory(userId, id, inputUpdates);

  return res.status(200).json({
    success: true,
    message: "Story updated successfully",
    data: story,
  });
});

// =========================
// DELETE STORY
// =========================
export const deleteStory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Story ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  await StoryService.deleteStory(userId, id);

  return res.status(200).json({
    success: true,
    message: "Story deleted successfully",
  });
});

// =========================
// GET USER'S STORIES (including drafts)
// =========================
export const getMyStories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { limit = "20", skip = "0", status } = req.query as {
    limit?: string;
    skip?: string;
    status?: string;
  };

  const result = await StoryService.getMyStories(userId, { limit, skip, status });

  return res.status(200).json({
    success: true,
    data: result.stories,
    pagination: result.pagination,
  });
});
