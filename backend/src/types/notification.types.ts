import type { NotificationType } from "../models/Notification.model.js";
import type { IUser } from "./user.types.js";

/**
 * Notification Interface
 */
export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId?: string;
  contentId?: string;
  contentType?: "Post" | "Story" | "Poll" | "Comment" | "ChatMessage";
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification with Actor Details
 */
export interface INotificationWithActor extends INotification {
  actor?: IUser; // Details of user who triggered the notification
}

/**
 * Create Notification DTO
 */
export interface ICreateNotification {
  userId: string;
  type: NotificationType;
  actorId?: string;
  contentId?: string;
  contentType?: "Post" | "Story" | "Poll" | "Comment" | "ChatMessage";
  message: string;
}

/**
 * Notification Counts
 */
export interface INotificationCounts {
  total: number;
  unread: number;
}
