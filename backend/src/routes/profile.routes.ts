import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { validateSchema } from "../utils/validation.util.js";
import {
  updateProfileSchema,
  usernameParamSchema,
  paginationQuerySchema,
} from "../schemas/profile.schema.js";
import {
  getProfile,
  getProfileById,
  getOwnProfile,
  updateProfile,
  getUserPosts,
  getUserStories,
  getUserPolls,
} from "../controllers/profile.controller.js";

const router = Router();

// ===========================
// PROFILE ROUTES
// ===========================

// Get own profile
router.get("/me", requireAuth(), getOwnProfile);

// Get user profile by ID (convenience endpoint)
router.get("/id/:userId", requireAuth(), getProfileById);

// Get user profile by username
router.get(
  "/:username",
  requireAuth(),
  validateSchema(usernameParamSchema, "params"),
  getProfile
);

// Update user profile (only own profile allowed)
router.put(
  "/:username",
  requireAuth(),
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
  requireAuth(),
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPosts
);

// Get user's stories
router.get(
  "/:username/stories",
  requireAuth(),
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserStories
);

// Get user's polls
router.get(
  "/:username/polls",
  requireAuth(),
  validateSchema(usernameParamSchema, "params"),
  validateSchema(paginationQuerySchema, "query"),
  getUserPolls
);

export default router;
