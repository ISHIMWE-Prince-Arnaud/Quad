import { Router } from "express";
import {
  createPost,
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
import { requireAuth } from "@clerk/express";

const router = Router();

/**
 * -------------------------
 * CREATE POST
 * POST /api/posts
 * Protected: User must be signed in
 * -------------------------
 */
router.post(
  "/",
  requireAuth(),
  validateSchema(createPostSchema),
  createPost
);

/**
 * -------------------------
 * GET POST BY ID
 * GET /api/posts/:id
 * Protected: Any signed-in user can access
 * -------------------------
 */
router.get(
  "/:id",
  requireAuth(),
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
  requireAuth(),
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
  requireAuth(),
  validateSchema(postIdSchema, "params"),
  deletePost
);

export default router;
