import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  updateProfileSchema,
  usernameParamSchema,
  paginationQuerySchema,
} from "../schemas/profile.schema.js";
import {
  getProfile,
  getProfileById,
  updateProfile,
  getUserPosts,
  getUserStories,
  getUserPolls,
} from "../controllers/profile.controller.js";

const router = Router();

// ===========================
// PROFILE ROUTES
// ===========================

/**
 * @swagger
 * /profile/id/{userId}:
 *   get:
 *     summary: Get a user profile by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/id/:userId", requireApiAuth, getProfileById);

/**
 * @swagger
 * /profile/{username}:
 *   get:
 *     summary: Get a user profile by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get(
  "/:username",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  getProfile,
);

/**
 * @swagger
 * /profile/{username}:
 *   put:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  "/:username",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(updateProfileSchema, "body"),
  updateProfile,
);

// ===========================
// USER CONTENT ROUTES
// ===========================

/**
 * @swagger
 * /profile/{username}/posts:
 *   get:
 *     summary: Get all posts created by a user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
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
 *         description: User posts page
 */
router.get(
  "/:username/posts",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPosts,
);

/**
 * @swagger
 * /profile/{username}/stories:
 *   get:
 *     summary: Get all stories created by a user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
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
 *         description: User stories page
 */
router.get(
  "/:username/stories",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserStories,
);

/**
 * @swagger
 * /profile/{username}/polls:
 *   get:
 *     summary: Get all polls created by a user
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
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
 *         description: User polls page
 */
router.get(
  "/:username/polls",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPolls,
);

export default router;
