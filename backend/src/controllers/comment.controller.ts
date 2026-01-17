import type { Request, Response } from "express";
import type {
  CreateCommentSchemaType,
  UpdateCommentSchemaType,
} from "../schemas/comment.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { CommentService } from "../services/comment.service.js";

// =========================
// CREATE COMMENT
// =========================
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId, text } = req.body as CreateCommentSchemaType;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const newComment = await CommentService.createComment(userId, {
    contentType,
    contentId,
    text,
  });

  return res.status(201).json({
    success: true,
    message: "Comment added",
    data: newComment,
  });
});

// =========================
// GET COMMENTS BY CONTENT (Optimized to prevent N+1 queries)
// =========================
export const getCommentsByContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { contentType, contentId } = req.params;
    const { limit = "20", skip = "0" } = req.query as {
      limit?: string;
      skip?: string;
    };

    if (!contentType || !contentId) {
      throw new AppError("contentType and contentId are required", 400);
    }

    const result = await CommentService.getCommentsByContent(contentType, contentId, {
      limit,
      skip,
    });

    return res.status(200).json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    });
  }
);

// =========================
// GET COMMENT BY ID
// =========================
export const getComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const comment = await CommentService.getComment(id);
  return res.status(200).json({ success: true, data: comment });
});

// =========================
// UPDATE COMMENT
// =========================
export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const { text } = req.body as UpdateCommentSchemaType;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const comment = await CommentService.updateComment(userId, id, text);

  return res.status(200).json({
    success: true,
    message: "Comment updated",
    data: comment,
  });
});

// =========================
// DELETE COMMENT
// =========================
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  await CommentService.deleteComment(userId, id);

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// =========================
// TOGGLE COMMENT LIKE
// =========================
export const toggleCommentLike = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.body as { commentId: string };
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await CommentService.toggleCommentLike(userId, commentId);
    return res.status(result.statusCode).json(result.body);
  }
);

// =========================
// GET COMMENT LIKES
// =========================
export const getCommentLikes = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Comment ID is required", 400);
  }

  const likes = await CommentService.getCommentLikes(id);

  return res.status(200).json({
    success: true,
    data: likes,
    count: likes.length,
  });
});
