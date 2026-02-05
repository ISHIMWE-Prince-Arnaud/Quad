import "../types/global.d.ts";
import type { Request, Response } from "express";
import type { GetFollowListQuerySchemaType } from "../schemas/follow.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { FollowService } from "../services/follow.service.js";

// =========================
// FOLLOW USER
// =========================
export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.auth?.userId;
  if (!currentUserId) {
    throw new AppError("Unauthorized", 401);
  }

  const { userId: targetUserId } = req.params as { userId: string };
  await FollowService.followUser(currentUserId, targetUserId);

  return res.status(201).json({
    success: true,
    message: "Successfully followed user",
  });
});

// =========================
// UNFOLLOW USER
// =========================
export const unfollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId: targetUserId } = req.params as { userId: string };
    await FollowService.unfollowUser(currentUserId, targetUserId);

    return res.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  },
);

// =========================
// GET FOLLOWERS
// =========================
export const getFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId: targetUserId } = req.params as { userId: string };
    const query = req.query as unknown as GetFollowListQuerySchemaType;

    const result = await FollowService.getFollowers(
      currentUserId,
      targetUserId,
      query,
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

// =========================
// GET FOLLOWING
// =========================
export const getFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId: targetUserId } = req.params as { userId: string };
    const query = req.query as unknown as GetFollowListQuerySchemaType;

    const result = await FollowService.getFollowing(
      currentUserId,
      targetUserId,
      query,
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

// =========================
// CHECK FOLLOWING STATUS
// =========================
export const checkFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId: targetUserId } = req.params as { userId: string };
    const data = await FollowService.checkFollowing(
      currentUserId,
      targetUserId,
    );

    return res.json({
      success: true,
      data,
    });
  },
);

// =========================
// GET FOLLOW STATS
// =========================
export const getFollowStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId: targetUserId } = req.params as { userId: string };
    const stats = await FollowService.getFollowStats(
      currentUserId,
      targetUserId,
    );

    return res.json({
      success: true,
      data: stats,
    });
  },
);
