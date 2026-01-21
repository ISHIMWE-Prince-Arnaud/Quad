import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";

/**
 * ChatMessage Document Interface
 */
export interface IChatMessageDocument extends Document {
  author: IUser;
  text?: string;
  mentions: string[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    // Author (embedded user snapshot)
    author: {
      type: Object,
      required: true,
    },

    // Message text (optional, no limit)
    text: {
      type: String,
      required: false,
    },

    // Mentioned usernames
    mentions: {
      type: [String],
      default: [],
    },

    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Index for message pagination (newest first)
ChatMessageSchema.index({ createdAt: -1 });

// Index for finding messages by author
ChatMessageSchema.index({ "author.clerkId": 1, createdAt: -1 });

// Index for finding messages with mentions
ChatMessageSchema.index({ mentions: 1, createdAt: -1 });

// ===========================
// VALIDATION
// ===========================

// Ensure at least text or media is present
ChatMessageSchema.pre("save", function (next) {
  if (!this.text) {
    return next(new Error("Message must have text"));
  }
  next();
});

export const ChatMessage = mongoose.model<IChatMessageDocument>(
  "ChatMessage",
  ChatMessageSchema
);
