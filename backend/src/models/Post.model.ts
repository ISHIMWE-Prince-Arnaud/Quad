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
  { timestamps: true }
);

export const Post = mongoose.model<IPostDocument>("Post", PostSchema);
