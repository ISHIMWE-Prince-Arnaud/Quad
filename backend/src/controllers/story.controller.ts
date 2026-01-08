/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { Story, type IStoryDocument } from "../models/Story.model.js";
import { logger } from "../utils/logger.util.js";
import { User } from "../models/User.model.js";
import type {
  CreateStorySchemaType,
  UpdateStorySchemaType,
  GetStoriesQuerySchemaType,
} from "../schemas/story.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitContentDeleted, emitNewContent } from "../sockets/feed.socket.js";
import { extractMentions } from "../utils/chat.util.js";
import { createNotification, generateNotificationMessage } from "../utils/notification.util.js";
import { findUserByUsernameOrAlias } from "../utils/userLookup.util.js";
import {
  calculateReadingTime,
  generateExcerpt,
  validateHtmlContent,
  sanitizeHtmlContent,
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Sanitize HTML content (XSS prevention)
    const sanitizedContent = sanitizeHtmlContent(storyData.content);

    // Validate HTML content is not empty after sanitization
    if (!validateHtmlContent(sanitizedContent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty HTML content",
      });
    }

    // Calculate reading time from sanitized content
    const readTime = calculateReadingTime(sanitizedContent);

    // Auto-generate excerpt if not provided (from sanitized content)
    const excerpt = storyData.excerpt || generateExcerpt(sanitizedContent, 200);

    // Create story with sanitized content
    const newStory = await Story.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      title: storyData.title,
      content: sanitizedContent, // ← Use sanitized content
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
      const io = getSocketIO();
      io.emit("newStory", newStory);
      emitNewContent(io, "story", String(newStory._id), newStory.author.clerkId);

      const mentions = extractMentions(newStory.content);
      if (mentions.length > 0) {
        for (const mentionedUsername of mentions) {
          const mentionedUser = await findUserByUsernameOrAlias(mentionedUsername);
          if (mentionedUser && mentionedUser.clerkId !== userId) {
            await createNotification({
              userId: mentionedUser.clerkId,
              type: "mention_story",
              actorId: userId,
              contentId: String(newStory._id),
              contentType: "Story",
              message: generateNotificationMessage("mention_story", user.username),
            });
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: newStory.status === "draft" ? "Draft saved" : "Story published",
      data: newStory,
    });
  } catch (error: any) {
    logger.error("Error creating story", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET ALL STORIES
// =========================
export const getAllStories = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId; // Optional for logged-in users
    const query = req.query as unknown as GetStoriesQuerySchemaType;

    // Build filter
    const filter: any = {};

    // Status filter (default: only published stories)
    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = "published"; // Default: only show published
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
    logger.error("Error fetching stories", error);
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
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    // Check permissions for drafts
    if (story.status === "draft" && story.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this draft",
      });
    }

    // Track view count (only for published stories and not the author)
    if (
      story.status === "published" &&
      userId &&
      userId !== story.author.clerkId
    ) {
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
        logger.error("View tracking error", viewError);
      }
    }

    return res.status(200).json({ success: true, data: story });
  } catch (error: any) {
    logger.error("Error fetching story", error);
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
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    // Only author can update
    if (story.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can update this story",
      });
    }

    // Sanitize and validate HTML content if being updated
    let sanitizedContent: string | undefined;
    if (inputUpdates.content) {
      sanitizedContent = sanitizeHtmlContent(inputUpdates.content);

      if (!validateHtmlContent(sanitizedContent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or empty HTML content",
        });
      }
    }

    // Create updates object with auto-generated fields
    // Type assertion needed due to exactOptionalPropertyTypes strictness
    const updates: Partial<IStoryDocument> = {
      ...inputUpdates,
    } as Partial<IStoryDocument>;

    // Use sanitized content if available
    if (sanitizedContent) {
      updates.content = sanitizedContent;

      // Update reading time with sanitized content
      updates.readTime = calculateReadingTime(sanitizedContent);

      // Auto-generate excerpt if not provided
      if (!inputUpdates.excerpt) {
        updates.excerpt = generateExcerpt(sanitizedContent, 200);
      }
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
        const io = getSocketIO();
        io.emit("newStory", story);
        emitNewContent(io, "story", String(story._id), story.author.clerkId);

        const mentions = extractMentions(story.content);
        if (mentions.length > 0) {
          for (const mentionedUsername of mentions) {
            const mentionedUser = await findUserByUsernameOrAlias(mentionedUsername);
            if (mentionedUser && mentionedUser.clerkId !== userId) {
              await createNotification({
                userId: mentionedUser.clerkId,
                type: "mention_story",
                actorId: userId,
                contentId: String(story._id),
                contentType: "Story",
                message: generateNotificationMessage("mention_story", story.author.username),
              });
            }
          }
        }
      } else {
        // Updated published story
        getSocketIO().emit("storyUpdated", story);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Story updated successfully",
      data: story,
    });
  } catch (error: any) {
    logger.error("Error updating story", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// DELETE STORY
// =========================
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Story ID is required" });
    }
    const userId = req.auth.userId;

    const story = await Story.findById(id);

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    // Only author can delete
    if (story.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can delete this story",
      });
    }

    // Delete story
    await Story.findByIdAndDelete(id);

    // Emit real-time event (only if was published)
    if (story.status === "published") {
      const io = getSocketIO();
      io.emit("storyDeleted", id);
      emitContentDeleted(io, "story", id);
    }

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting story", error);
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
    logger.error("Error fetching user stories", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
