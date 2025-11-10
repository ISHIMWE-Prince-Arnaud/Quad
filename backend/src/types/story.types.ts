import type { IUser } from "./user.types.js";

/**
 * Story Status
 * - draft: Saved but not published (only author can see)
 * - published: Live and visible to everyone
 */
export type StoryStatus = "draft" | "published";

/**
 * Story Interface (Blog/Medium-style long-form post)
 * NOT Instagram stories - these are permanent blog articles
 */
export interface IStory {
  id: string;
  author: IUser;                    // User snapshot (embedded for performance)
  
  // Content
  title: string;                    // Story title (required)
  content: string;                  // Rich text content (HTML from editor)
  excerpt?: string;                 // Short preview text (auto-generated or custom)
  coverImage?: string;              // Cover image URL from Cloudinary
  
  // Metadata
  status: StoryStatus;              // draft or published
  tags?: string[];                  // Categories/topics for filtering
  readTime?: number;                // Estimated reading time in minutes
  
  // Engagement (cached counts for performance)
  viewsCount?: number;              // How many times viewed
  reactionsCount?: number;          // Total reactions
  commentsCount?: number;           // Total comments
  
  // Timestamps
  createdAt?: Date;                 // When created
  updatedAt?: Date;                 // When last edited
  publishedAt?: Date;               // When published (null if draft)
}

/**
 * Story View (for tracking who viewed the story)
 */
export interface IStoryView {
  id: string;
  storyId: string;
  userId: string;                   // Clerk user ID
  viewedAt: Date;
}

/**
 * Create Story DTO (Data Transfer Object)
 */
export interface ICreateStory {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: StoryStatus;             // Default: "draft"
  tags?: string[];
}

/**
 * Update Story DTO
 */
export interface IUpdateStory {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: StoryStatus;
  tags?: string[];
}