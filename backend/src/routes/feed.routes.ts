import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { feedQuerySchema } from "../schemas/feed.schema.js";
import {
  getFollowingFeed,
  getForYouFeed,
} from "../controllers/feed.controller.js";

const router = Router();

// ===========================
// FEED ROUTES
// ===========================

/**
 * @swagger
 * /feed:
 *   get:
 *     summary: Get the personalized feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feed data returned
 */
router.get(
  "/",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed,
);

/**
 * @swagger
 * /feed/following:
 *   get:
 *     summary: Get feed consisting only of followed users
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Following Feed data returned
 */
router.get(
  "/following",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getFollowingFeed,
);

/**
 * @swagger
 * /feed/foryou:
 *   get:
 *     summary: Get the 'For You' personalized feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: For You Feed data returned
 */
router.get(
  "/foryou",
  requireApiAuth,
  validateSchema(feedQuerySchema, "query"),
  getForYouFeed,
);

export default router;
