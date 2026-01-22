// src/routes/user.routes.ts
import { Router } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import {
  createUserSchema,
  updateUserProfileSchema,
  getUserSchema,
  deleteUserSchema,
} from "../schemas/user.schema.js";

import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

/**
 * -------------------------
 * CREATE USER
 * POST /api/users
 * Protected: Must be signed in
 * -------------------------
 */
router.post(
  "/",
  authRateLimiter, // Rate limit user creation
  requireApiAuth, // API authentication using Clerk session
  validateSchema(createUserSchema), // Validate request body
  createUser // Controller handles creation
);

/**
 * -------------------------
 * GET USER BY ID
 * GET /api/users/:clerkId
 * Protected: Users can only access their own info
 * -------------------------
 */
router.get(
  "/:clerkId",
  requireApiAuth,
  validateSchema(getUserSchema, "params"),
  getUser
);

/**
 * -------------------------
 * UPDATE USER
 * PUT /api/users/:clerkId
 * Protected: Users can only update their own info
 * -------------------------
 */
router.put(
  "/:clerkId",
  requireApiAuth,
  validateSchema(updateUserProfileSchema),
  updateUser
);

/**
 * -------------------------
 * DELETE USER
 * DELETE /api/users/:clerkId
 * Protected: Users can only delete their own account
 * -------------------------
 */
router.delete(
  "/:clerkId",
  requireApiAuth,
  validateSchema(deleteUserSchema, "params"),
  deleteUser
);

export default router;
