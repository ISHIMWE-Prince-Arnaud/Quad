import mongoose, { Schema, Document } from "mongoose";
import type { ICommentLike } from "../types/comment.types.js";

export interface ICommentLikeDocument extends Omit<ICommentLike, "_id">, Document {}

const CommentLikeSchema = new Schema<ICommentLikeDocument>(
  {
    commentId: { 
      type: String, 
      required: true,
      index: true
    },
    userId: { 
      type: String, 
      required: true,
      index: true
    },
    username: { type: String, required: true },
  },
  { 
    timestamps: true 
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================
// Compound unique index: One like per user per comment
CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

// Index for comment's likes
CommentLikeSchema.index({ commentId: 1, createdAt: -1 });

// Index for user's liked comments
CommentLikeSchema.index({ userId: 1, createdAt: -1 });

export const CommentLike = mongoose.model<ICommentLikeDocument>("CommentLike", CommentLikeSchema);
