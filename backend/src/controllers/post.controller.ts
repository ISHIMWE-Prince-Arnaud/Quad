import type { Request, Response } from "express";
import {
  type CreatePostSchemaType,
  type UpdatePostSchemaType,
  getPostsQuerySchema,
} from "../schemas/post.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { PostService } from "../services/post.service.js";

import { PostMapper } from "../utils/mappers/post.mapper.js";

// =========================
// CREATE POST
// =========================
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as CreatePostSchemaType;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const post = await PostService.createPost(userId, {
    ...(data.text !== undefined ? { text: data.text } : {}),
    media: PostMapper.normalizeMedia(data.media),
  });
  return res.status(201).json({ success: true, data: post });
});

// =========================
// GET ALL POSTS
// =========================
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const validation = getPostsQuerySchema.safeParse(req.query);

  if (!validation.success) {
    throw new AppError(
      `Invalid query parameters: ${validation.error.errors
        .map((e) => e.message)
        .join(", ")}`,
      400
    );
  }

  const { limit, skip } = validation.data;

  const result = await PostService.getAllPosts(limit, skip);

  return res.status(200).json({
    success: true,
    data: result.posts,
    pagination: result.pagination,
  });
});

// =========================
// GET POST
// =========================
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const post = await PostService.getPost(id);
  return res.status(200).json({ success: true, data: post });
});

// =========================
// UPDATE POST
// =========================
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const updates = req.body as UpdatePostSchemaType;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const updatedPost = await PostService.updatePost(userId, id, {
    ...(updates.text !== undefined ? { text: updates.text } : {}),
    ...(updates.media !== undefined
      ? { media: PostMapper.normalizeMedia(updates.media) }
      : {}),
  });
  return res.status(200).json({ success: true, data: updatedPost });
});

// =========================
// DELETE POST
// =========================
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    throw new AppError("Post ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  await PostService.deletePost(userId, id);

  return res
    .status(200)
    .json({ success: true, message: "Post deleted successfully" });
});
