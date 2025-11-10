import type { Request, Response } from "express";
import { Story, type IStoryDocument } from "../models/Story.model.js";
import { User } from "../models/User.model.js";
import type { 
  CreateStorySchemaType, 
  UpdateStorySchemaType,
  GetStoriesQuerySchemaType 
} from "../schemas/story.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  calculateReadingTime,
  generateExcerpt,
  validateHtmlContent,
} from "../utils/story.util.js";

// =========================
// CREATE STORY
// =========================
export const createStory = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const storyData = req.body as CreateStorySchemaType;

    // Get user info
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate HTML content (basic XSS prevention)
    if (!validateHtmlContent(storyData.content)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid HTML content detected" 
      });
    }

    // Calculate reading time
    const readTime = calculateReadingTime(storyData.content);

    // Generate excerpt if not provided
    const excerpt = storyData.excerpt || generateExcerpt(storyData.content, 200);

    // Create story
    const newStory = await Story.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        profileImage: user.profileImage,
      },
      title: storyData.title,
      content: storyData.content,
      excerpt,
      coverImage: storyData.coverImage,
      status: storyData.status || "draft",
      tags: storyData.tags || [],
      readTime,
      viewsCount: 0,
      reactionsCount: 0,
      commentsCount: 0,
    });

    // Emit real-time event only if published
    if (newStory.status === "published") {
      getSocketIO().emit("newStory", newStory);
    }

    return res.status(201).json({ 
      success: true, 
      message: newStory.status === "draft" ? "Draft saved" : "Story published",
      data: newStory 
    });
  } catch (error: any) {
    console.error("Error creating story:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET ALL STORIES
// =========================
export const getAllStories = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;  // Optional for logged-in users
    const query = req.query as unknown as GetStoriesQuerySchemaType;

    // Build filter
    const filter: any = {};

    // Status filter (default: only published stories)
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = "published";  // Default: only show published
    }

    // Tag filter
    if (query.tag) {
      filter.tags = query.tag;
    }

    // Author filter
    if (query.authorId) {
      filter["author.clerkId"] = query.authorId;
    }

    // Search filter (uses text index)
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Build sort
    let sort: any = {};
    switch (query.sortBy) {
      case "newest":
        sort = { publishedAt: -1, createdAt: -1 };
        break;
      case "oldest":
        sort = { publishedAt: 1, createdAt: 1 };
        break;
      case "popular":
        sort = { reactionsCount: -1, publishedAt: -1 };
        break;
      case "views":
        sort = { viewsCount: -1, publishedAt: -1 };
        break;
      default:
        sort = { publishedAt: -1, createdAt: -1 };
    }

    // Execute query with pagination
    const stories = await Story.find(filter)
      .sort(sort)
      .limit(query.limit)
      .skip(query.skip)
      .lean();

    const total = await Story.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: stories,
      pagination: {
        total,
        limit: query.limit,
        skip: query.skip,
        hasMore: query.skip + stories.length < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching stories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET SINGLE STORY
// =========================
export const getStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Check permissions for drafts
    if (story.status === "draft" && story.author.clerkId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to view this draft" 
      });
    }

    // Track view count (only for published stories and not the author)
    if (story.status === "published" && userId && userId !== story.author.clerkId) {
      try {
        // Simply increment view count
        story.viewsCount = (story.viewsCount || 0) + 1;
        await story.save();

        // Emit real-time view count update
        getSocketIO().emit("storyViewUpdated", {
          storyId: id,
          viewsCount: story.viewsCount,
        });
      } catch (viewError) {
        // Don't fail request if view tracking fails
        console.error("View tracking error:", viewError);
      }
    }

    return res.status(200).json({ success: true, data: story });
  } catch (error: any) {
    console.error("Error fetching story:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE STORY
// =========================
export const updateStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const inputUpdates = req.body as UpdateStorySchemaType;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Only author can update
    if (story.author.clerkId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the author can update this story" 
      });
    }

    // Validate HTML content if content is being updated
    if (inputUpdates.content && !validateHtmlContent(inputUpdates.content)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid HTML content detected" 
      });
    }

    // Create updates object with auto-generated fields
    // Type assertion needed due to exactOptionalPropertyTypes strictness
    const updates: Partial<IStoryDocument> = { ...inputUpdates } as Partial<IStoryDocument>;

    // Update reading time if content changed
    if (inputUpdates.content) {
      updates.readTime = calculateReadingTime(inputUpdates.content);
    }

    // Auto-generate excerpt if content changed but excerpt not provided
    if (inputUpdates.content && !inputUpdates.excerpt) {
      updates.excerpt = generateExcerpt(inputUpdates.content, 200);
    }

    // Track if status changed to published
    const wasPublished = story.status === "published";
    const nowPublished = inputUpdates.status === "published";

    // Update story
    Object.assign(story, updates);
    await story.save();

    // Emit appropriate real-time event
    if (nowPublished) {
      if (!wasPublished) {
        // Newly published
        getSocketIO().emit("newStory", story);
      } else {
        // Updated published story
        getSocketIO().emit("storyUpdated", story);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: "Story updated successfully",
      data: story 
    });
  } catch (error: any) {
    console.error("Error updating story:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// DELETE STORY
// =========================
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Only author can delete
    if (story.author.clerkId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only the author can delete this story" 
      });
    }

    // Delete story
    await Story.findByIdAndDelete(id);

    // Emit real-time event (only if was published)
    if (story.status === "published") {
      getSocketIO().emit("storyDeleted", id);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Story deleted successfully" 
    });
  } catch (error: any) {
    console.error("Error deleting story:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S STORIES (including drafts)
// =========================
export const getMyStories = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { limit = "20", skip = "0", status } = req.query;

    const filter: any = { "author.clerkId": userId };

    // Optional status filter
    if (status === "draft" || status === "published") {
      filter.status = status;
    }

    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Story.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: stories,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + stories.length < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user stories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

