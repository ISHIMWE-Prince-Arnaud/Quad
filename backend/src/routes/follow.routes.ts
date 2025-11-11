import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { validateSchema } from "../utils/validation.util.js";
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
  getMutualFollows,
  getFollowStatsController,
} from "../controllers/follow.controller.js";

const router = Router();

// ===========================
// FOLLOW/UNFOLLOW ROUTES
// ===========================

// Follow a user
router.post(
  "/:userId",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  followUser
);

// Unfollow a user
router.delete(
  "/:userId",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  unfollowUser
);

// ===========================
// FOLLOW LIST ROUTES
// ===========================

// Get user's followers
router.get(
  "/:userId/followers",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  validateSchema(getFollowListQuerySchema, "query"),
  getFollowers
);

// Get users that a user is following
router.get(
  "/:userId/following",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  validateSchema(getFollowListQuerySchema, "query"),
  getFollowing
);

// ===========================
// FOLLOW STATUS ROUTES
// ===========================

// Check if following a user
router.get(
  "/:userId/check",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  checkFollowing
);

// Get mutual follows
router.get(
  "/:userId/mutual",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  getMutualFollows
);

// Get follow statistics
router.get(
  "/:userId/stats",
  requireAuth(),
  validateSchema(userIdParamSchema, "params"),
  getFollowStatsController
);

export default router;
