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

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
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
 *         description: List of user notifications
 */
router.get(
  "/",
  requireApiAuth,
  validateSchema(getNotificationsQuerySchema, "query"),
  getNotifications,
);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 */
router.get("/unread-count", requireApiAuth, getUnreadCountController);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all system notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", requireApiAuth, markAllAsRead);

/**
 * @swagger
 * /notifications/read:
 *   delete:
 *     summary: Delete all currently read notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Read notifications deleted
 */
router.delete("/read", requireApiAuth, deleteAllRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch(
  "/:id/read",
  requireApiAuth,
  validateSchema(notificationIdParamSchema, "params"),
  markAsRead,
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a single notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
router.delete(
  "/:id",
  requireApiAuth,
  validateSchema(notificationIdParamSchema, "params"),
  deleteNotification,
);

export default router;
