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
 * @openapi
 * /stories:
 *   post:
 *     summary: Create a new story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStory'
 *     responses:
 *       201:
 *         description: Story created successfully
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createStorySchema),
  createStory
);

/**
 * @openapi
 * /stories:
 *   get:
 *     summary: Get all published stories
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of stories
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
