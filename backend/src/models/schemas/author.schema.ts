import { Schema } from "mongoose";

/**
 * Shared sub-schema for embedded author snapshots.
 * Used by Post, ChatMessage, Story, and Poll models to validate
 * the shape of the denormalized author object.
 */
export const AuthorSnapshotSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    displayName: { type: String },
    bio: { type: String },
  },
  { _id: false },
);
