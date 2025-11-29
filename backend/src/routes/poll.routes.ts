import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  createPollSchema,
  updatePollSchema,
  voteOnPollSchema,
  pollIdSchema,
  getPollsQuerySchema,
} from "../schemas/poll.schema.js";
import {
  createPoll,
  getAllPolls,
  getMyPolls,
  getPoll,
  updatePoll,
  deletePoll,
  voteOnPoll,
  removeVote,
  closePoll,
} from "../controllers/poll.controller.js";

const router = Router();

// ===========================
// POLL CRUD ROUTES
// ===========================

// Create poll
router.post(
  "/",
  requireApiAuth,
  validateSchema(createPollSchema, "body"),
  createPoll
);

// Get all polls (with filters, search, pagination)
router.get(
  "/",
  requireApiAuth,
  validateSchema(getPollsQuerySchema, "query"),
  getAllPolls
);

// Get my polls (polls created by current user)
router.get("/me", requireApiAuth, getMyPolls);

// Get single poll
router.get(
  "/:id",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  getPoll
);

// Update poll (author only)
router.put(
  "/:id",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  validateSchema(updatePollSchema, "body"),
  updatePoll
);

// Delete poll (author only)
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  deletePoll
);

// ===========================
// VOTING ROUTES
// ===========================

// Vote on poll
router.post(
  "/:id/vote",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  validateSchema(voteOnPollSchema, "body"),
  voteOnPoll
);

// Remove vote (author only)
router.delete(
  "/:id/vote",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  removeVote
);

// ===========================
// POLL MANAGEMENT ROUTES
// ===========================

// Close poll (author only)
router.post(
  "/:id/close",
  requireApiAuth,
  validateSchema(pollIdSchema, "params"),
  closePoll
);

export default router;
