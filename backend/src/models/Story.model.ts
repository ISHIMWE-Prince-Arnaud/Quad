import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";
import type { StoryStatus } from "../types/story.types.js";

/**
 * Story Document Interface
 * Extends IStory with Mongoose Document properties
 */
export interface IStoryDocument extends Document {
  userId: string; // Clerk ID for efficient queries
  author: IUser;
  title: string;
  content: string;              // Rich text HTML
  excerpt?: string;
  coverImage?: string;
  status: StoryStatus;
  tags?: string[];
  readTime?: number;            // Minutes
  viewsCount?: number;
  reactionsCount?: number;
  commentsCount?: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const StorySchema = new Schema<IStoryDocument>(
  {
    userId: { type: String, required: true }, // Clerk ID for efficient queries
    author: { type: Object, required: true }, // User snapshot (embedded)
    
    // Content fields
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200 
    },
    content: { 
      type: String, 
      required: true 
    },
    excerpt: { 
      type: String, 
      trim: true,
      maxlength: 500 
    },
    coverImage: { 
      type: String 
    },
    
    // Metadata
    status: { 
      type: String, 
      enum: ["draft", "published"], 
      default: "draft" 
    },
    tags: [{ 
      type: String, 
      trim: true, 
      lowercase: true 
    }],
    readTime: { 
      type: Number, 
      min: 0 
    },
    
    // Cached counts (for performance)
    viewsCount: { type: Number, default: 0 },
    reactionsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    
    // Publishing timestamp
    publishedAt: { type: Date },
  },
  { 
    timestamps: true,  // Auto-creates createdAt and updatedAt
    minimize: false 
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Index for fetching all published stories (newest first)
StorySchema.index({ status: 1, publishedAt: -1 });

// Index for user's stories (all statuses)
StorySchema.index({ userId: 1, createdAt: -1 });

// Index for published stories by specific author
StorySchema.index({ userId: 1, status: 1, publishedAt: -1 });

// Text index for search (title, content, tags)
StorySchema.index({ 
  title: "text", 
  content: "text", 
  tags: "text" 
});

// Index for filtering by tags
StorySchema.index({ tags: 1, status: 1, publishedAt: -1 });

// Index for sorting by views/popularity
StorySchema.index({ viewsCount: -1, publishedAt: -1 });

// ===========================
// METHODS
// ===========================

/**
 * Auto-set publishedAt when status changes to published
 */
StorySchema.pre("save", function (next) {
  // If story is being published for the first time
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // If story is unpublished (back to draft), clear publishedAt
  if (this.status === "draft" && this.publishedAt) {
    delete this.publishedAt;  // Remove the property entirely
  }
  
  next();
});

export const Story = mongoose.model<IStoryDocument>("Story", StorySchema);
