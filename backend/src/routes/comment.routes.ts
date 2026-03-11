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
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a comment on a post, story, or poll
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *               - contentId
 *               - text
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [Post, Story, Poll]
 *               contentId:
 *                 type: string
 *               text:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createCommentSchema),
  createComment,
);

/**
 * @swagger
 * /comments/{contentType}/{contentId}:
 *   get:
 *     summary: Get comments for a specific content item
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Story, Poll]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments retrieved
 */
router.get("/:contentType/:contentId", requireApiAuth, getCommentsByContent);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a specific comment by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment data
 */
router.get(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  getComment,
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.put(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  validateSchema(updateCommentSchema),
  updateComment,
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (cascades to replies/likes)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  deleteComment,
);

/**
 * @swagger
 * /comments/like:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment like toggled
 */
router.post(
  "/like",
  requireApiAuth,
  validateSchema(toggleCommentLikeSchema),
  toggleCommentLike,
);

/**
 * @swagger
 * /comments/{id}/likes:
 *   get:
 *     summary: Get all users who liked a comment
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users who liked the comment
 */
router.get(
  "/:id/likes",
  requireApiAuth,
  validateSchema(commentIdSchema, "params"),
  getCommentLikes,
);

export default router;
