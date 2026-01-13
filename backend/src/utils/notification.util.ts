import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js";
import { logger } from "./logger.util.js";
import type { ICreateNotification, INotificationWithActor } from "../types/notification.types.js";
import { getSocketIO } from "../config/socket.config.js";

/**
 * Create and emit a notification
 */
export const createNotification = async (
  data: ICreateNotification
): Promise<void> => {
  try {
    // Create notification
    const notification = await Notification.create(data);

    // Get actor details if actorId exists
    let actor = null;
    if (data.actorId) {
      actor = await User.findOne({ clerkId: data.actorId }).select(
        "clerkId username displayName profileImage"
      );
    }

    // Format notification with actor
    const notificationWithActor: INotificationWithActor = {
      id: String(notification._id),
      userId: notification.userId,
      type: notification.type,
      actorId: notification.actorId,
      contentId: notification.contentId,
      contentType: notification.contentType,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actor: actor
        ? {
        clerkId: actor.clerkId,
        username: actor.username,
        email: actor.email,
        displayName: actor.displayName,
        profileImage: actor.profileImage,
        }
        : undefined,
    };

    // Emit real-time notification
    getSocketIO().to(data.userId).emit("notification:new", notificationWithActor);
  } catch (error) {
    logger.error("Error creating notification", error);
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await Notification.countDocuments({ userId, isRead: false });
};

/**
 * Mark multiple notifications as read
 */
export const markNotificationsAsRead = async (
  userId: string,
  notificationIds?: string[]
): Promise<number> => {
  const query: Record<string, unknown> = { userId, isRead: false };
  
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  const result = await Notification.updateMany(query, { isRead: true });
  return result.modifiedCount;
};

/**
 * Delete read notifications for a user
 */
export const deleteReadNotifications = async (userId: string): Promise<number> => {
  const result = await Notification.deleteMany({ userId, isRead: true });
  return result.deletedCount;
};

/**
 * Generate notification message based on type
 */
export const generateNotificationMessage = (
  type: string,
  _actorUsername?: string,
  _contentType?: string
): string => {
  switch (type) {
    case "follow":
      return "started following you";
    
    case "reaction_post":
      return "reacted to your post";
    
    case "reaction_story":
      return "reacted to your story";
    
    case "reaction_poll":
      return "reacted to your poll";
    
    case "comment_post":
      return "commented on your post";
    
    case "comment_story":
      return "commented on your story";
    
    case "comment_poll":
      return "commented on your poll";
    
    case "comment_reply":
      return "replied to your comment";

    case "mention_post":
      return "mentioned you in a post";

    case "mention_story":
      return "mentioned you in a story";

    case "mention_comment":
      return "mentioned you in a comment";
    
    case "chat_mention":
      return "mentioned you in chat";
    
    case "poll_expired":
      return "Your poll has expired";
    
    case "poll_milestone":
      return "Your poll reached a voting milestone";
    
    default:
      return "You have a new notification";
  }
};
