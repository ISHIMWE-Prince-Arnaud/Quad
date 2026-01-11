import { Story, type IStoryDocument } from "../models/Story.model.js";
import { User } from "../models/User.model.js";
import type {
  CreateStorySchemaType,
  GetStoriesQuerySchemaType,
  UpdateStorySchemaType,
} from "../schemas/story.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitContentDeleted, emitNewContent } from "../sockets/feed.socket.js";
import { extractMentions } from "../utils/chat.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { findUserByUsernameOrAlias } from "../utils/userLookup.util.js";
import {
  calculateReadingTime,
  generateExcerpt,
  sanitizeHtmlContent,
  validateHtmlContent,
} from "../utils/story.util.js";
import { AppError } from "../utils/appError.util.js";

export class StoryService {
  static async createStory(userId: string, storyData: CreateStorySchemaType) {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const sanitizedContent = sanitizeHtmlContent(storyData.content);

    if (!validateHtmlContent(sanitizedContent)) {
      throw new AppError("Invalid or empty HTML content", 400);
    }

    const readTime = calculateReadingTime(sanitizedContent);
    const excerpt = storyData.excerpt || generateExcerpt(sanitizedContent, 200);

    const newStory = await Story.create({
      userId,
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        ...(user.profileImage !== undefined
          ? { profileImage: user.profileImage }
          : {}),
        ...(user.bio !== undefined ? { bio: user.bio } : {}),
      },
      title: storyData.title,
      content: sanitizedContent,
      excerpt,
      ...(storyData.coverImage !== undefined
        ? { coverImage: storyData.coverImage }
        : {}),
      status: storyData.status || "draft",
      tags: storyData.tags || [],
      readTime,
      viewsCount: 0,
      reactionsCount: 0,
      commentsCount: 0,
    });

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

    return newStory;
  }

  static async getAllStories(
    _userId: string | undefined,
    query: GetStoriesQuerySchemaType
  ) {
    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = "published";
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.authorId) {
      filter["author.clerkId"] = query.authorId;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

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

    const stories = await Story.find(filter)
      .sort(sort)
      .limit(query.limit)
      .skip(query.skip)
      .lean();

    const total = await Story.countDocuments(filter);

    return {
      stories,
      pagination: {
        total,
        limit: query.limit,
        skip: query.skip,
        hasMore: query.skip + stories.length < total,
      },
    };
  }

  static async getStory(id: string, userId?: string) {
    const story = await Story.findById(id);
    if (!story) {
      throw new AppError("Story not found", 404);
    }

    if (story.status === "draft" && story.author.clerkId !== userId) {
      throw new AppError("You don't have permission to view this draft", 403);
    }

    if (story.status === "published" && userId && userId !== story.author.clerkId) {
      try {
        story.viewsCount = (story.viewsCount || 0) + 1;
        await story.save();

        getSocketIO().emit("storyViewUpdated", {
          storyId: id,
          viewsCount: story.viewsCount,
        });
      } catch {
        // best-effort
      }
    }

    return story;
  }

  static async updateStory(userId: string, id: string, inputUpdates: UpdateStorySchemaType) {
    const story = await Story.findById(id);
    if (!story) {
      throw new AppError("Story not found", 404);
    }

    if (story.author.clerkId !== userId) {
      throw new AppError("Only the author can update this story", 403);
    }

    let sanitizedContent: string | undefined;
    if (inputUpdates.content) {
      sanitizedContent = sanitizeHtmlContent(inputUpdates.content);

      if (!validateHtmlContent(sanitizedContent)) {
        throw new AppError("Invalid or empty HTML content", 400);
      }
    }

    const updates: Partial<IStoryDocument> = {
      ...inputUpdates,
    } as Partial<IStoryDocument>;

    if (sanitizedContent) {
      updates.content = sanitizedContent;
      updates.readTime = calculateReadingTime(sanitizedContent);

      if (!inputUpdates.excerpt) {
        updates.excerpt = generateExcerpt(sanitizedContent, 200);
      }
    }

    const wasPublished = story.status === "published";
    const nowPublished = inputUpdates.status === "published";

    Object.assign(story, updates);
    await story.save();

    if (nowPublished) {
      if (!wasPublished) {
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
                message: generateNotificationMessage(
                  "mention_story",
                  story.author.username
                ),
              });
            }
          }
        }
      } else {
        getSocketIO().emit("storyUpdated", story);
      }
    }

    return story;
  }

  static async deleteStory(userId: string, id: string) {
    const story = await Story.findById(id);
    if (!story) {
      throw new AppError("Story not found", 404);
    }

    if (story.author.clerkId !== userId) {
      throw new AppError("Only the author can delete this story", 403);
    }

    await Story.findByIdAndDelete(id);

    if (story.status === "published") {
      const io = getSocketIO();
      io.emit("storyDeleted", id);
      emitContentDeleted(io, "story", id);
    }
  }

  static async getMyStories(
    userId: string,
    opts: { limit?: string; skip?: string; status?: any }
  ) {
    const { limit = "20", skip = "0", status } = opts;

    const filter: any = { "author.clerkId": userId };

    if (status === "draft" || status === "published") {
      filter.status = status;
    }

    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Story.countDocuments(filter);

    return {
      stories,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + stories.length < total,
      },
    };
  }
}
