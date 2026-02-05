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

// Follow a user
router.post(
  "/:userId",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  followUser,
);

// Unfollow a user
router.delete(
  "/:userId",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  unfollowUser,
);

// ===========================
// FOLLOW LIST ROUTES
// ===========================

// Get user's followers
router.get(
  "/:userId/followers",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  validateSchema(getFollowListQuerySchema, "query"),
  getFollowers,
);

// Get users that a user is following
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

// Check if following a user
router.get(
  "/:userId/check",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  checkFollowing,
);

// Get follow statistics
router.get(
  "/:userId/stats",
  requireApiAuth,
  validateSchema(userIdParamSchema, "params"),
  getFollowStatsController,
);

export default router;
