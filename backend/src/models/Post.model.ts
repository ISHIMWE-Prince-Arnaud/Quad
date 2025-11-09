import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";
import type { IMedia, IReaction } from "../types/post.types.js";

export interface IPostDocument extends Document {
  author: IUser;
  text?: string;
  media: IMedia[];
  reactions?: IReaction[];
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
    reactions: [
      {
        userId: { type: String, required: true },
        type: { type: String, required: true }, // e.g., "heart"
      },
    ],
    commentsCount: { type: Number, default: 0 },
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

// Index for finding posts with specific reactions (future feature)
PostSchema.index({ "reactions.userId": 1 });

export const Post = mongoose.model<IPostDocument>("Post", PostSchema);
