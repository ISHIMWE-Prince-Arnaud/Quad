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
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePost'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", requireApiAuth, validateSchema(createPostSchema), createPost);

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
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
 *         description: List of posts
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
