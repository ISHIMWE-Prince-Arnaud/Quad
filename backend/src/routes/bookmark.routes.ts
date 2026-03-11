import { Router } from "express";

import {
  checkBookmark,
  createBookmark,
  getBookmarks,
  removeBookmark,
} from "../controllers/bookmark.controller.js";

import {
  bookmarkParamsSchema,
  createBookmarkSchema,
  getBookmarksQuerySchema,
} from "../schemas/bookmark.schema.js";

import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../utils/validation.util.js";

const router = Router();

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Bookmark a piece of content
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
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [Post, Story, Poll]
 *               contentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bookmark created
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createBookmarkSchema),
  createBookmark,
);

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get all bookmarks for the authenticated user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user bookmarks
 */
router.get(
  "/",
  requireApiAuth,
  validateSchema(getBookmarksQuerySchema, "query"),
  getBookmarks,
);

/**
 * @swagger
 * /bookmarks/{contentType}/{contentId}/check:
 *   get:
 *     summary: Check if a specific content item is bookmarked
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
 *     responses:
 *       200:
 *         description: Bookmark status boolean
 */
router.get(
  "/:contentType/:contentId/check",
  requireApiAuth,
  validateSchema(bookmarkParamsSchema, "params"),
  checkBookmark,
);

/**
 * @swagger
 * /bookmarks/{contentType}/{contentId}:
 *   delete:
 *     summary: Remove a bookmark
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
 *     responses:
 *       200:
 *         description: Bookmark removed
 */
router.delete(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(bookmarkParamsSchema, "params"),
  removeBookmark,
);

export default router;
