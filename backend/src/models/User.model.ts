import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true }, // Clerk user ID
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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

export const User = mongoose.model<IUserDocument>("User", UserSchema);
