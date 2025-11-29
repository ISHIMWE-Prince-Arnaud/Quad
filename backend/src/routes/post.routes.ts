import { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

import {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
} from "../schemas/post.schema.js";

import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * -------------------------
 * CREATE POST
 * POST /api/posts
 * Protected: User must be signed in
 * -------------------------
 */
router.post("/", requireApiAuth, validateSchema(createPostSchema), createPost);

/**
 * -------------------------
 * GET ALL POSTS
 * GET /api/posts
 * Protected: Any signed-in user can access
 * Query params: limit (default: 20), skip (default: 0)
 * -------------------------
 */
router.get("/", requireApiAuth, getAllPosts);

/**
 * -------------------------
 * GET POST BY ID
 * GET /api/posts/:id
 * Protected: Any signed-in user can access
 * -------------------------
 */
router.get(
  "/:id",
  requireApiAuth,
  validateSchema(postIdSchema, "params"),
  getPost
);

/**
 * -------------------------
 * UPDATE POST
 * PUT /api/posts/:id
 * Protected: Only post author can update
 * -------------------------
 */
router.put(
  "/:id",
  requireApiAuth,
  validateSchema(postIdSchema, "params"),
  validateSchema(updatePostSchema),
  updatePost
);

/**
 * -------------------------
 * DELETE POST
 * DELETE /api/posts/:id
 * Protected: Only post author can delete
 * -------------------------
 */
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(postIdSchema, "params"),
  deletePost
);

export default router;
