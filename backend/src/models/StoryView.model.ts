import mongoose, { Schema, Document } from "mongoose";

/**
 * StoryView Document Interface
 * Tracks who viewed which story (for analytics)
 */
export interface IStoryViewDocument extends Document {
  storyId: mongoose.Types.ObjectId;
  userId: string;               // Clerk user ID
  viewedAt: Date;
}

const StoryViewSchema = new Schema<IStoryViewDocument>(
  {
    storyId: { 
      type: Schema.Types.ObjectId, 
      ref: "Story", 
      required: true 
    },
    userId: { 
      type: String, 
      required: true 
    },
    viewedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: false  // We only care about viewedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Compound index: One view per user per story
// (prevents duplicate views from same user)
StoryViewSchema.index({ storyId: 1, userId: 1 }, { unique: true });

// Index for getting all views of a story
StoryViewSchema.index({ storyId: 1, viewedAt: -1 });

// Index for getting all stories viewed by a user
StoryViewSchema.index({ userId: 1, viewedAt: -1 });

// TTL index: Auto-delete views after 90 days (optional, for privacy)
// Comment this out if you want to keep views forever
StoryViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const StoryView = mongoose.model<IStoryViewDocument>("StoryView", StoryViewSchema);
