import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js";
import type { GetNotificationsQuerySchemaType } from "../schemas/notification.schema.js";
import {
  deleteReadNotifications,
  getUnreadCount,
  markNotificationsAsRead,
} from "../utils/notification.util.js";
import { AppError } from "../utils/appError.util.js";

export class NotificationService {
  static async getNotifications(userId: string, query: GetNotificationsQuerySchemaType) {
    const { page, limit, unreadOnly } = query;

    const filter: Record<string, unknown> = { userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    const actorIds = [
      ...new Set(
        notifications.filter((n) => n.actorId).map((n) => n.actorId as string)
      ),
    ];

    const actors = await User.find({ clerkId: { $in: actorIds } }).select(
      "clerkId username displayName profileImage"
    );

    const actorMap = new Map(actors.map((actor) => [actor.clerkId, actor]));

    const formattedNotifications = notifications.map((notification) => ({
      id: String(notification._id),
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

    return {
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  static async getUnreadCount(userId: string) {
    const count = await getUnreadCount(userId);
    return count;
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
  }

  static async markAllAsRead(userId: string) {
    return await markNotificationsAsRead(userId);
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
  }

  static async deleteAllRead(userId: string) {
    return await deleteReadNotifications(userId);
  }
}
