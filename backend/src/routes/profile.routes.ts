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

// Get user profile by ID (convenience endpoint)
router.get("/id/:userId", requireApiAuth, getProfileById);

// Get user profile by username
router.get(
  "/:username",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  getProfile
);

// Update user profile (only own profile allowed)
router.put(
  "/:username",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(updateProfileSchema, "body"),
  updateProfile
);

// ===========================
// USER CONTENT ROUTES
// ===========================

// Get user's posts
router.get(
  "/:username/posts",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPosts
);

// Get user's stories
router.get(
  "/:username/stories",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserStories
);

// Get user's polls
router.get(
  "/:username/polls",
  requireApiAuth,
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPolls
);

export default router;
