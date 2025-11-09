import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID - AUTO INDEXED (unique)
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // AUTO INDEXED (unique)
    profileImage: { 
      type: String,
      default: () => {
        const randomNumber = Math.floor(Math.random() * 100) + 1; // 1-100
        return `https://avatar.iran.liara.run/public/${randomNumber}`;
      }
    },
    bio: { type: String },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================
// Note: clerkId and email already have unique indexes (defined in schema)
// Index for username search/lookup (case-insensitive future-ready)
UserSchema.index({ username: 1 });

// Index for searching users by creation date (e.g., newest users)
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUserDocument>("User", UserSchema);
