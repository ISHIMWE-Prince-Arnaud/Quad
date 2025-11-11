import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { validateSchema } from "../utils/validation.util.js";
import {
  notificationIdParamSchema,
  getNotificationsQuerySchema,
} from "../schemas/notification.schema.js";
import {
  getNotifications,
  getUnreadCountController,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from "../controllers/notification.controller.js";

const router = Router();

// ===========================
// NOTIFICATION ROUTES
// ===========================

// Get user's notifications
router.get(
  "/",
  requireAuth(),
  validateSchema(getNotificationsQuerySchema, "query"),
  getNotifications
);

// Get unread notification count
router.get(
  "/unread-count",
  requireAuth(),
  getUnreadCountController
);

// Mark all notifications as read
router.patch(
  "/read-all",
  requireAuth(),
  markAllAsRead
);

// Delete all read notifications
router.delete(
  "/read",
  requireAuth(),
  deleteAllRead
);

// Mark notification as read
router.patch(
  "/:id/read",
  requireAuth(),
  validateSchema(notificationIdParamSchema, "params"),
  markAsRead
);

// Delete a notification
router.delete(
  "/:id",
  requireAuth(),
  validateSchema(notificationIdParamSchema, "params"),
  deleteNotification
);

export default router;
