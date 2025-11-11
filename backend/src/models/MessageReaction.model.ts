import mongoose, { Schema, Document } from "mongoose";

/**
 * MessageReaction Document Interface
 */
export interface IMessageReactionDocument extends Document {
  messageId: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  emoji: string;
  createdAt: Date;
}

const MessageReactionSchema = new Schema<IMessageReactionDocument>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    emoji: {
      type: String,
      required: true,
      maxlength: 10, // Support multi-character emojis
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Compound unique index: One emoji per user per message
// User can react with different emojis, but not duplicate same emoji
MessageReactionSchema.index(
  { messageId: 1, userId: 1, emoji: 1 },
  { unique: true }
);

// Index for getting all reactions of a message
MessageReactionSchema.index({ messageId: 1, createdAt: -1 });

// Index for getting user's reactions
MessageReactionSchema.index({ userId: 1, createdAt: -1 });

export const MessageReaction = mongoose.model<IMessageReactionDocument>(
  "MessageReaction",
  MessageReactionSchema
);
