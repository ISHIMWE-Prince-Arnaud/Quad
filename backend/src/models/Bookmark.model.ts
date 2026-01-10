import mongoose, { Schema, Document } from "mongoose";

export type BookmarkContentType = "post" | "story" | "poll";

export interface IBookmarkDocument extends Document {
  userId: string;
  contentType: BookmarkContentType;
  contentId: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmarkDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ["post", "story", "poll"],
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

BookmarkSchema.index(
  { userId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);

BookmarkSchema.index({ userId: 1, createdAt: -1 });

BookmarkSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

export const Bookmark = mongoose.model<IBookmarkDocument>(
  "Bookmark",
  BookmarkSchema
);
