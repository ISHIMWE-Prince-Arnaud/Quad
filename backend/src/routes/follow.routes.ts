import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  userIdParamSchema,
  getFollowListQuerySchema,
} from "../schemas/follow.schema.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
  getFollowStatsController,
} from "../controllers/follow.controller.js";

const router = Router();

// ===========================
// FOLLOW/UNFOLLOW ROUTES
// ===========================

/**
 * @swagger
 * /follow/{userId}:
 *   post:
 *     summary: Follow a user
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
 *         description: User followed successfully
 */
router.post(
  "/:userId",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  followUser,
);

/**
 * @swagger
 * /follow/{userId}:
 *   delete:
 *     summary: Unfollow a user
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
 *         description: User unfollowed successfully
 */
router.delete(
  "/:userId",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  unfollowUser,
);

// ===========================
// FOLLOW LIST ROUTES
// ===========================

/**
 * @swagger
 * /follow/{userId}/followers:
 *   get:
 *     summary: Get a list of the user's followers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Followers list returned
 */
router.get(
  "/:userId/followers",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  validateSchema(getFollowListQuerySchema, "query"),
  getFollowers,
);

/**
 * @swagger
 * /follow/{userId}/following:
 *   get:
 *     summary: Get the list of users this user is following
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Following list returned
 */
router.get(
  "/:userId/following",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  validateSchema(getFollowListQuerySchema, "query"),
  getFollowing,
);

// ===========================
// FOLLOW STATUS ROUTES
// ===========================

/**
 * @swagger
 * /follow/{userId}/check:
 *   get:
 *     summary: Check if the authenticated user is following this user
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
 *         description: Follow status boolean returned
 */
router.get(
  "/:userId/check",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  checkFollowing,
);

/**
 * @swagger
 * /follow/{userId}/stats:
 *   get:
 *     summary: Get user follow statistics (follower/following counts)
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
 *         description: Follow statistics object
 */
router.get(
  "/:userId/stats",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  getFollowStatsController,
);

export default router;
