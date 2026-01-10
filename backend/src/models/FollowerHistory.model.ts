import mongoose, { Schema, Document } from "mongoose";

export interface IFollowerHistoryDocument extends Document {
  userId: string;
  followersCount: number;
  followingCount: number;
  date: Date;
  createdAt?: Date;
}

const FollowerHistorySchema = new Schema<IFollowerHistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    followersCount: { type: Number, required: true, min: 0 },
    followingCount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

FollowerHistorySchema.index({ userId: 1, date: 1 }, { unique: true });
FollowerHistorySchema.index({ date: -1 });

export const FollowerHistory = mongoose.model<IFollowerHistoryDocument>(
  "FollowerHistory",
  FollowerHistorySchema
);
