import { Router } from "express";
import {
  createStory,
  getAllStories,
  getStory,
  updateStory,
  deleteStory,
  getMyStories,
} from "../controllers/story.controller.js";
import {
  createStorySchema,
  updateStorySchema,
  storyIdSchema,
  getStoriesQuerySchema,
} from "../schemas/story.schema.js";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * -------------------------
 * CREATE STORY (Draft or Published)
 * POST /api/stories
 * Protected: User must be signed in
 * Body: { title, content, excerpt?, coverImage?, status?, tags? }
 * -------------------------
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createStorySchema),
  createStory
);

/**
 * -------------------------
 * GET ALL PUBLISHED STORIES
 * GET /api/stories
 * Protected: User must be signed in
 * Query params:
 *   - status: "draft" | "published" (default: published)
 *   - tag: string (filter by tag)
 *   - authorId: string (filter by author)
 *   - search: string (full-text search)
 *   - sortBy: "newest" | "oldest" | "popular" | "views" (default: newest)
 *   - limit: number (default: 20, max: 100)
 *   - skip: number (default: 0)
 * -------------------------
 */
router.get(
  "/",
  requireApiAuth,
  validateSchema(getStoriesQuerySchema, "query"),
  getAllStories
);

/**
 * -------------------------
 * GET MY STORIES (including drafts)
 * GET /api/stories/me
 * Protected: User must be signed in
 * Query params:
 *   - status: "draft" | "published" (optional)
 *   - limit: number (default: 20)
 *   - skip: number (default: 0)
 * -------------------------
 */
router.get("/me", requireApiAuth, getMyStories);

/**
 * -------------------------
 * GET SINGLE STORY
 * GET /api/stories/:id
 * Protected: User must be signed in
 * Auto-tracks view (if not author)
 * -------------------------
 */
router.get(
  "/:id",
  requireApiAuth,
  validateSchema(storyIdSchema, "params"),
  getStory
);

/**
 * -------------------------
 * UPDATE STORY
 * PUT /api/stories/:id
 * Protected: Only story author can update
 * Body: { title?, content?, excerpt?, coverImage?, status?, tags? }
 * -------------------------
 */
router.put(
  "/:id",
  requireApiAuth,
  validateSchema(storyIdSchema, "params"),
  validateSchema(updateStorySchema),
  updateStory
);

/**
 * -------------------------
 * DELETE STORY
 * DELETE /api/stories/:id
 * Protected: Only story author can delete
 * Also deletes all associated views
 * -------------------------
 */
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(storyIdSchema, "params"),
  deleteStory
);

export default router;
