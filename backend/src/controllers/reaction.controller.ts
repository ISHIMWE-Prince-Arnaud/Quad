import type { Request, Response } from "express";
import type { CreateReactionSchemaType } from "../schemas/reaction.schema.js";
import type { ReactableContentType } from "../types/reaction.types.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { ReactionService } from "../services/reaction.service.js";

// =========================
// CREATE OR UPDATE REACTION
// =========================
export const toggleReaction = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId, type } = req.body as CreateReactionSchemaType;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await ReactionService.toggleReaction(userId, {
    contentType,
    contentId,
    type,
  });

  return res.status(result.statusCode).json(result.body);
});

// =========================
// GET REACTIONS BY CONTENT (Optimized to prevent N+1 queries)
// =========================
export const getReactionsByContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { contentType, contentId } = req.params as {
      contentType: ReactableContentType;
      contentId: string;
    };

    const userId = req.auth?.userId;
    const data = await ReactionService.getReactionsByContent(
      contentType,
      contentId,
      userId
    );

    return res.status(200).json({
      success: true,
      data,
    });
  }
);

// =========================
// GET USER'S REACTIONS
// =========================
export const getUserReactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { limit = "20", skip = "0" } = req.query as {
    limit?: string;
    skip?: string;
  };

  const result = await ReactionService.getUserReactions(userId, limit, skip);

  return res.status(200).json({
    success: true,
    data: result.reactions,
    pagination: result.pagination,
  });
});

// =========================
// DELETE REACTION (Alternative to toggle)
// =========================
export const deleteReaction = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.params as {
    contentType: ReactableContentType;
    contentId: string;
  };

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const reactionCount = await ReactionService.deleteReaction(
    userId,
    contentType,
    contentId
  );

  return res.status(200).json({
    success: true,
    message: "Reaction removed",
    reactionCount,
  });
});
