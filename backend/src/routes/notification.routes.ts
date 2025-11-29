import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
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
  requireApiAuth,
  validateSchema(getNotificationsQuerySchema, "query"),
  getNotifications
);

// Get unread notification count
router.get("/unread-count", requireApiAuth, getUnreadCountController);

// Mark all notifications as read
router.patch("/read-all", requireApiAuth, markAllAsRead);

// Delete all read notifications
router.delete("/read", requireApiAuth, deleteAllRead);

// Mark notification as read
router.patch(
  "/:id/read",
  requireApiAuth,
  validateSchema(notificationIdParamSchema, "params"),
  markAsRead
);

// Delete a notification
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(notificationIdParamSchema, "params"),
  deleteNotification
);

export default router;
