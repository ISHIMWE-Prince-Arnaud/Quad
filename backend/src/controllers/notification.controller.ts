/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js";
import type { GetNotificationsQuerySchemaType } from "../schemas/notification.schema.js";
import {
  getUnreadCount,
  markNotificationsAsRead,
  deleteReadNotifications,
} from "../utils/notification.util.js";
import { logger } from "../utils/logger.util.js";

// =========================
// GET NOTIFICATIONS
// =========================
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const query = req.query as unknown as GetNotificationsQuerySchemaType;
    const { page, limit, unreadOnly } = query;

    // Build filter
    const filter: any = { userId: currentUserId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get notifications
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    // Get unique actor IDs
    const actorIds = [
      ...new Set(
        notifications.filter((n) => n.actorId).map((n) => n.actorId as string)
      ),
    ];

    // Get actor details
    const actors = await User.find({ clerkId: { $in: actorIds } }).select(
      "clerkId username displayName profileImage"
    );

    // Map actors by clerkId for quick lookup
    const actorMap = new Map(actors.map((actor) => [actor.clerkId, actor]));

    // Format notifications with actor details
    const formattedNotifications = notifications.map((notification) => ({
      id: (notification._id as any).toString(),
      userId: notification.userId,
      type: notification.type,
      actorId: notification.actorId,
      contentId: notification.contentId,
      contentType: notification.contentType,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actor: notification.actorId
        ? actorMap.get(notification.actorId as string)
        : undefined,
    }));

    return res.json({
      success: true,
      data: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching notifications", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET UNREAD COUNT
// =========================
export const getUnreadCountController = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;

    const count = await getUnreadCount(currentUserId);

    return res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: any) {
    logger.error("Error fetching unread count", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// MARK AS READ
// =========================
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { id: notificationId } = req.params as { id: string };

    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: currentUserId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error: any) {
    logger.error("Error marking notification as read", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// MARK ALL AS READ
// =========================
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;

    const count = await markNotificationsAsRead(currentUserId);

    return res.json({
      success: true,
      message: `${count} notification(s) marked as read`,
      data: { count },
    });
  } catch (error: any) {
    logger.error("Error marking all notifications as read", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE NOTIFICATION
// =========================
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;
    const { id: notificationId } = req.params as { id: string };

    // Find and delete notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: currentUserId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error: any) {
    logger.error("Error deleting notification", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE ALL READ NOTIFICATIONS
// =========================
export const deleteAllRead = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.auth.userId;

    const count = await deleteReadNotifications(currentUserId);

    return res.json({
      success: true,
      message: `${count} read notification(s) deleted`,
      data: { count },
    });
  } catch (error: any) {
    logger.error("Error deleting read notifications", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
