import mongoose, { Schema, Document } from "mongoose";

/**
 * Follow Document Interface
 */
export interface IFollowDocument extends Document {
  userId: string; // Clerk ID of user who is following
  followingId: string; // Clerk ID of user being followed
  createdAt: Date;
}

const FollowSchema = new Schema<IFollowDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    followingId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Compound unique index: Prevent duplicate follows
// A user can only follow another user once
FollowSchema.index({ userId: 1, followingId: 1 }, { unique: true });

// Index for getting all followers of a user
FollowSchema.index({ followingId: 1, createdAt: -1 });

// Index for getting all users a user is following
FollowSchema.index({ userId: 1, createdAt: -1 });

// ===========================
// VALIDATION
// ===========================

// Prevent self-following
FollowSchema.pre("save", function (next) {
  if (this.userId === this.followingId) {
    return next(new Error("Users cannot follow themselves"));
  }
  next();
});

export const Follow = mongoose.model<IFollowDocument>("Follow", FollowSchema);
