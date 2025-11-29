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
 * -------------------------
 * TOGGLE REACTION (Create/Update/Delete)
 * POST /api/reactions
 * Protected: User must be signed in
 * Body: { contentType, contentId, type }
 * -------------------------
 */
router.post(
  "/",
  requireApiAuth,
  validateSchema(createReactionSchema),
  toggleReaction
);

/**
 * -------------------------
 * GET USER'S REACTIONS
 * GET /api/reactions/me
 * Protected: User must be signed in
 * Returns: All reactions by current user
 * Note: Must be before /:contentType/:contentId to avoid route conflicts
 * -------------------------
 */
router.get("/me", requireApiAuth, getUserReactions);

/**
 * -------------------------
 * GET REACTIONS BY CONTENT
 * GET /api/reactions/:contentType/:contentId
 * Protected: User must be signed in
 * Returns: All reactions for content with aggregated counts
 * -------------------------
 */
router.get(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(getReactionsByContentSchema, "params"),
  getReactionsByContent
);

/**
 * -------------------------
 * DELETE REACTION
 * DELETE /api/reactions/:contentType/:contentId
 * Protected: User must be signed in
 * -------------------------
 */
router.delete(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(deleteReactionSchema, "params"),
  deleteReaction
);

export default router;
