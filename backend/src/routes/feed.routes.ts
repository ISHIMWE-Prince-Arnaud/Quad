import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { validateSchema } from "../utils/validation.util.js";
import { feedQuerySchema, newCountQuerySchema } from "../schemas/feed.schema.js";
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
  requireAuth(),
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed
);

// Get following feed
router.get(
  "/following",
  requireAuth(),
  validateSchema(feedQuerySchema, "query"),
  getFollowingFeed
);

// Get for you feed
router.get(
  "/foryou",
  requireAuth(),
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed
);

// Get new content count (for "X new posts" banner)
router.get(
  "/new-count",
  requireAuth(),
  validateSchema(newCountQuerySchema, "query"),
  getNewContentCount
);

export default router;
