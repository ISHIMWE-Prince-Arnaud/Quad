import { Router } from "express";
import {
  toggleReaction,
  getReactionsByContent,
  getUserReactions,
  deleteReaction,
} from "../controllers/reaction.controller.js";

import {
  createReactionSchema,
  getReactionsByContentSchema,
  deleteReactionSchema,
} from "../schemas/reaction.schema.js";

import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /reactions:
 *   post:
 *     summary: Toggle a reaction on a post, story, or poll (Create/Update/Delete)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *               - contentId
 *               - type
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [Post, Story, Poll]
 *               contentId:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reaction toggled successfully
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createReactionSchema),
  toggleReaction,
);

/**
 * @swagger
 * /reactions/me:
 *   get:
 *     summary: Get all reactions made by the current user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's reactions
 */
router.get("/me", requireApiAuth, getUserReactions);

/**
 * @swagger
 * /reactions/{contentType}/{contentId}:
 *   get:
 *     summary: Get all reactions for a specific content item with aggregated counts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Story, Poll]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reactions for the content
 */
router.get(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(getReactionsByContentSchema, "params"),
  getReactionsByContent,
);

/**
 * @swagger
 * /reactions/{contentType}/{contentId}:
 *   delete:
 *     summary: Delete the current user's reaction from a content item
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Post, Story, Poll]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reaction deleted successfully
 */
router.delete(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(deleteReactionSchema, "params"),
  deleteReaction,
);

export default router;
