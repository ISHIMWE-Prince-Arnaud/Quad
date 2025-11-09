import mongoose, { Schema, Document } from "mongoose";
import type { IReaction, ReactableContentType } from "../types/reaction.types.js";

export interface IReactionDocument extends Omit<IReaction, "_id">, Document {}

const ReactionSchema = new Schema<IReactionDocument>(
  {
    contentType: {
      type: String,
      enum: ["post", "story", "poll", "comment"],
      required: true,
      index: true  // For querying reactions by content type
    },
    contentId: { 
      type: String, 
      required: true,
      index: true  // For querying reactions by content
    },
    userId: { 
      type: String, 
      required: true,
      index: true  // For querying user's reactions
    },
    username: { type: String, required: true },
    profileImage: { type: String },
    type: { 
      type: String, 
      enum: ["like", "love", "laugh", "wow", "sad", "angry"],
      required: true 
    },
  },
  { 
    timestamps: true 
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================
// Compound index for content reactions (most common query)
ReactionSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

// Compound unique index: One reaction per user per content
ReactionSchema.index({ contentType: 1, contentId: 1, userId: 1 }, { unique: true });

// Index for user's reaction history
ReactionSchema.index({ userId: 1, createdAt: -1 });

// Index for reaction type analytics
ReactionSchema.index({ type: 1 });

// Index for content-specific queries
ReactionSchema.index({ contentId: 1, type: 1 });

export const Reaction = mongoose.model<IReactionDocument>("Reaction", ReactionSchema);
