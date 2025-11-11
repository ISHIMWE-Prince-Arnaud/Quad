import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "follow"
  | "reaction_post"
  | "reaction_story"
  | "reaction_poll"
  | "comment_post"
  | "comment_story"
  | "comment_poll"
  | "comment_reply"
  | "chat_mention"
  | "poll_expired"
  | "poll_milestone";

/**
 * Notification Document Interface
 */
export interface INotificationDocument extends Document {
  userId: string; // Clerk ID of user receiving notification
  type: NotificationType;
  actorId?: string; // Clerk ID of user who triggered notification
  contentId?: string; // ID of related content (post, story, poll, comment, etc.)
  contentType?: "Post" | "Story" | "Poll" | "Comment" | "ChatMessage";
  message: string; // Notification message
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "follow",
        "reaction_post",
        "reaction_story",
        "reaction_poll",
        "comment_post",
        "comment_story",
        "comment_poll",
        "comment_reply",
        "chat_mention",
        "poll_expired",
        "poll_milestone",
      ],
    },

    actorId: {
      type: String,
      index: true,
    },

    contentId: {
      type: String,
      index: true,
    },

    contentType: {
      type: String,
      enum: ["Post", "Story", "Poll", "Comment", "ChatMessage"],
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Compound index for getting user's unread notifications
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Index for getting all notifications for a user sorted by date
NotificationSchema.index({ userId: 1, createdAt: -1 });

// TTL index: Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Notification = mongoose.model<INotificationDocument>(
  "Notification",
  NotificationSchema
);
