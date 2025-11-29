import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  feedQuerySchema,
  newCountQuerySchema,
} from "../schemas/feed.schema.js";
import {
  getFollowingFeed,
  getForYouFeed,
  getNewContentCount,
} from "../controllers/feed.controller.js";

const router = Router();

// ===========================
// FEED ROUTES
// ===========================

// Get general feed (defaults to for you feed)
router.get(
  "/",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed
);

// Get following feed
router.get(
  "/following",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getFollowingFeed
);

// Get for you feed
router.get(
  "/foryou",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed
);

// Get new content count (for "X new posts" banner)
router.get(
  "/new-count",
  requireApiAuth,
  validateSchema(newCountQuerySchema, "query"),
  getNewContentCount
);

export default router;
