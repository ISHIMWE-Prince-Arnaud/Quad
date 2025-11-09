import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";
import type { IMedia } from "../types/post.types.js";

export interface IPostDocument extends Document {
  author: IUser;
  text?: string;
  media: IMedia[];
  // Note: reactions are now in separate Reaction collection
  reactionsCount?: number;
  commentsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPostDocument>(
  {
    author: { type: Object, required: true }, // store user info snapshot
    text: { type: String },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], required: true },
      },
    ],
    // Note: reactions moved to separate Reaction collection
    reactionsCount: { type: Number, default: 0 },  // Cached count
    commentsCount: { type: Number, default: 0 },   // Cached count
  },
  { timestamps: true, minimize: false }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================
// Index for sorting posts by creation date (newest first)
PostSchema.index({ createdAt: -1 });

// Index for querying posts by author (e.g., user profile, user's posts)
PostSchema.index({ "author.clerkId": 1 });

// Compound index for author + date (optimizes user timeline queries)
PostSchema.index({ "author.clerkId": 1, createdAt: -1 });

// Note: Reaction indexes moved to Reaction.model.ts

export const Post = mongoose.model<IPostDocument>("Post", PostSchema);
