import { Router } from "express";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../utils/validation.util.js";
import { getAnalyticsQuerySchema } from "../schemas/analytics.schema.js";
import {
  getEngagementSummary,
  getFollowerGrowth,
  getProfileAnalytics,
  recordProfileView,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get(
  "/profile",
  requireApiAuth,
  validateSchema(getAnalyticsQuerySchema, "query"),
  getProfileAnalytics
);

router.get(
  "/followers",
  requireApiAuth,
  validateSchema(getAnalyticsQuerySchema, "query"),
  getFollowerGrowth
);

router.get("/summary", requireApiAuth, getEngagementSummary);

router.post("/profile-view", requireApiAuth, recordProfileView);

export default router;
