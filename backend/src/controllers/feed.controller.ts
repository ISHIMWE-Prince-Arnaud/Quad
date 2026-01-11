/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import type {
  FeedQuerySchemaType,
  NewCountQuerySchemaType,
} from "../schemas/feed.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { FeedService } from "../services/feed.service.js";

// =========================
// GET FOLLOWING FEED
// =========================
export const getFollowingFeed = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const query = req.query as unknown as FeedQuerySchemaType;
  const response = await FeedService.getFollowingFeed(userId, query);

  return res.json({
    success: true,
    data: response,
  });
});

// =========================
// GET FOR YOU FEED
// =========================
export const getForYouFeed = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const query = req.query as unknown as FeedQuerySchemaType;
  const response = await FeedService.getForYouFeed(userId, query);

  return res.json({
    success: true,
    data: response,
  });
});

// =========================
// GET NEW CONTENT COUNT
// =========================
export const getNewContentCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const query = req.query as unknown as NewCountQuerySchemaType;
  const data = await FeedService.getNewContentCount(userId, query);

  return res.json({
    success: true,
    data,
  });
});
