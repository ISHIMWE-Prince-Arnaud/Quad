import mongoose, { Schema, Document } from "mongoose";
import type { IComment } from "../types/comment.types.js";

export interface ICommentDocument extends Omit<IComment, "_id">, Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    contentType: {
      type: String,
      enum: ["post", "story", "poll"],
      required: true,
      index: true  // For querying comments by content type
    },
    contentId: { 
      type: String, 
      required: true,
      index: true  // For querying comments by content
    },
    author: {
      clerkId: { type: String, required: true },
      username: { type: String, required: true },
      email: { type: String, required: true },
      profileImage: { type: String },
    },
    text: { 
      type: String, 
      required: true,
      maxlength: 2000  // Limit comment length
    },
    parentId: { 
      type: String,
      index: true  // For querying replies
    },
    reactionsCount: { type: Number, default: 0 },  // Cached count for reactions (from Reaction model)
    likesCount: { type: Number, default: 0 },      // Cached count for likes (from CommentLike model)
    repliesCount: { type: Number, default: 0 },    // Cached count for replies
  },
  { 
    timestamps: true 
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================
// Compound index for content comments sorted by date
CommentSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

// Index for top-level comments (no parent) on specific content
CommentSchema.index({ contentType: 1, contentId: 1, parentId: 1, createdAt: -1 });

// Index for user's comments
CommentSchema.index({ "author.clerkId": 1, createdAt: -1 });

// Index for finding replies to a specific comment
CommentSchema.index({ parentId: 1, createdAt: 1 });

// Index for content-specific queries
CommentSchema.index({ contentId: 1, createdAt: -1 });

export const Comment = mongoose.model<ICommentDocument>("Comment", CommentSchema);
