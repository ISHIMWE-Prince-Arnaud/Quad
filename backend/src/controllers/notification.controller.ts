import type { Request, Response } from "express";
import type { GetNotificationsQuerySchemaType } from "../schemas/notification.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { NotificationService } from "../services/notification.service.js";
import {
  emitNotificationDeleted,
  emitNotificationRead,
  emitNotificationsClearedRead,
  emitNotificationsReadAll,
} from "../utils/notification.util.js";

// =========================
// GET NOTIFICATIONS
// =========================
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const query = req.query as unknown as GetNotificationsQuerySchemaType;
    const result = await NotificationService.getNotifications(
      currentUserId,
      query,
    );

    return res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  },
);

// =========================
// GET UNREAD COUNT
// =========================
export const getUnreadCountController = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await NotificationService.getUnreadCount(currentUserId);

    return res.json({
      success: true,
      data: { unreadCount: count },
    });
  },
);

// =========================
// MARK AS READ
// =========================
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.auth?.userId;
  if (!currentUserId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id: notificationId } = req.params as { id: string };
  await NotificationService.markAsRead(currentUserId, notificationId);

  void emitNotificationRead(currentUserId, notificationId);

  return res.json({
    success: true,
    message: "Notification marked as read",
  });
});

// =========================
// MARK ALL AS READ
// =========================
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await NotificationService.markAllAsRead(currentUserId);

    void emitNotificationsReadAll(currentUserId);

    return res.json({
      success: true,
      message: `${count} notification(s) marked as read`,
      data: { count },
    });
  },
);

// =========================
// DELETE NOTIFICATION
// =========================
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const { id: notificationId } = req.params as { id: string };
    await NotificationService.deleteNotification(currentUserId, notificationId);

    void emitNotificationDeleted(currentUserId, notificationId);

    return res.json({
      success: true,
      message: "Notification deleted",
    });
  },
);

// =========================
// DELETE ALL READ NOTIFICATIONS
// =========================
export const deleteAllRead = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUserId = req.auth?.userId;
    if (!currentUserId) {
      throw new AppError("Unauthorized", 401);
    }

    const count = await NotificationService.deleteAllRead(currentUserId);

    void emitNotificationsClearedRead(currentUserId);

    return res.json({
      success: true,
      message: `${count} read notification(s) deleted`,
      data: { count },
    });
  },
);
