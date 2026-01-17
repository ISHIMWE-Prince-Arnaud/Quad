import { Router } from "express";
import {
  createComment,
  getCommentsByContent,
  getComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentLikes,
} from "../controllers/comment.controller.js";

import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
  toggleCommentLikeSchema,
} from "../schemas/comment.schema.js";

import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * -------------------------
 * CREATE COMMENT
 * POST /api/comments
 * Protected: User must be signed in
 * Body: { contentType, contentId, text }
 * -------------------------
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createCommentSchema),
  createComment
);

/**
 * -------------------------
 * GET COMMENTS BY CONTENT
 * GET /api/comments/:contentType/:contentId
 * Protected: User must be signed in
 * Query params: limit, skip
 * -------------------------
 */
router.get("/:contentType/:contentId", requireApiAuth, getCommentsByContent);

/**
 * -------------------------
 * GET COMMENT BY ID
 * GET /api/comments/:id
 * Protected: User must be signed in
 * -------------------------
 */
router.get(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  getComment
);

/**
 * -------------------------
 * UPDATE COMMENT
 * PUT /api/comments/:id
 * Protected: Only comment author can update
 * Body: { text }
 * -------------------------
 */
router.put(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  validateSchema(updateCommentSchema),
  updateComment
);

/**
 * -------------------------
 * DELETE COMMENT
 * DELETE /api/comments/:id
 * Protected: Only comment author can delete
 * Cascades: Deletes all replies and likes
 * -------------------------
 */
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  deleteComment
);

/**
 * -------------------------
 * TOGGLE COMMENT LIKE
 * POST /api/comments/like
 * Protected: User must be signed in
 * Body: { commentId }
 * -------------------------
 */
router.post(
  "/like",
  requireApiAuth,
  validateSchema(toggleCommentLikeSchema),
  toggleCommentLike
);

/**
 * -------------------------
 * GET COMMENT LIKES
 * GET /api/comments/:id/likes
 * Protected: User must be signed in
 * Returns: All users who liked the comment
 * -------------------------
 */
router.get(
  "/:id/likes",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  getCommentLikes
);

export default router;
