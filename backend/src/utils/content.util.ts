import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { logger } from "./logger.util.js";
import sanitizeHtml from "sanitize-html";

import type { ReactableContentType } from "../types/reaction.types.js";
import type { CommentableContentType } from "../types/comment.types.js";
import type { IPost } from "../types/post.types.js";
import type { IStory } from "../types/story.types.js";
import type { IPoll } from "../types/poll.types.js";

/**
 * Type guards for content types
 */
export const isPost = (content: any): content is IPost => {
  return content && (content.type === "post" || (content.media && !content.question && !content.title));
};

export const isStory = (content: any): content is IStory => {
  return content && (content.type === "story" || content.title !== undefined);
};

export const isPoll = (content: any): content is IPoll => {
  return content && (content.type === "poll" || content.question !== undefined);
};

/**
 * Verify that content exists for reactions
 */
export const verifyReactableContent = async (
  contentType: ReactableContentType,
  contentId: string
): Promise<{ exists: boolean; content?: unknown }> => {
  try {
    let content = null;

    switch (contentType) {
      case "post":
        content = await Post.findById(contentId);
        break;
      case "story":
        content = await Story.findById(contentId);
        // Only allow reactions on published stories
        if (content && content.status !== "published") {
          return { exists: false };
        }
        break;
      case "poll":
        content = await Poll.findById(contentId);
        break;
      case "comment": {
        // Comments can be reacted to
        const { Comment } = await import("../models/Comment.model.js");
        content = await Comment.findById(contentId);
        break;
      }
      default:
        return { exists: false };
    }

    return { exists: !!content, content };
  } catch (error) {
    logger.error("Error verifying reactable content", error);
    return { exists: false };
  }
};

/**
 * Verify that content exists for comments
 */
export const verifyCommentableContent = async (
  contentType: CommentableContentType,
  contentId: string
): Promise<{ exists: boolean; content?: unknown }> => {
  try {
    let content = null;

    switch (contentType) {
      case "post":
        content = await Post.findById(contentId);
        break;
      case "story":
        content = await Story.findById(contentId);
        // Only allow comments on published stories
        if (content && content.status !== "published") {
          return { exists: false };
        }
        break;
      case "poll":
        content = await Poll.findById(contentId);
        break;
      default:
        return { exists: false };
    }

    return { exists: !!content, content };
  } catch (error) {
    logger.error("Error verifying commentable content", error);
    return { exists: false };
  }
};

/**
 * Update content's comment count
 */
export const updateContentCommentsCount = async (
  contentType: CommentableContentType,
  contentId: string,
  increment: number
): Promise<void> => {
  try {
    switch (contentType) {
      case "post":
        await Post.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
        break;
      case "story":
        await Story.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
        break;
      case "poll":
        await Poll.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
        break;
    }
  } catch (error) {
    logger.error("Error updating content comments count", error);
  }
};

export const setContentReactionsCount = async (
  contentType: ReactableContentType,
  contentId: string,
  reactionsCount: number
): Promise<void> => {
  try {
    const safeCount = Math.max(0, reactionsCount);
    switch (contentType) {
      case "post":
        await Post.findByIdAndUpdate(contentId, { $set: { reactionsCount: safeCount } });
        break;
      case "story":
        await Story.findByIdAndUpdate(contentId, { $set: { reactionsCount: safeCount } });
        break;
      case "poll":
        await Poll.findByIdAndUpdate(contentId, { $set: { reactionsCount: safeCount } });
        break;
      case "comment": {
        const { Comment } = await import("../models/Comment.model.js");
        await Comment.findByIdAndUpdate(contentId, { $set: { reactionsCount: safeCount } });
        break;
      }
    }
  } catch (error) {
    logger.error("Error setting content reactions count", error);
  }
};

/**
 * Update content's reaction count
 */
export const updateContentReactionsCount = async (
  contentType: ReactableContentType,
  contentId: string,
  increment: number
): Promise<void> => {
  try {
    const pipeline = [
      {
        $set: {
          reactionsCount: {
            $max: [
              0,
              {
                $add: [{ $ifNull: ["$reactionsCount", 0] }, increment],
              },
            ],
          },
        },
      },
    ];
    switch (contentType) {
      case "post":
        await Post.findByIdAndUpdate(contentId, pipeline);
        break;
      case "story":
        await Story.findByIdAndUpdate(contentId, pipeline);
        break;
      case "poll":
        await Poll.findByIdAndUpdate(contentId, pipeline);
        break;
      case "comment": {
        const { Comment } = await import("../models/Comment.model.js");
        await Comment.findByIdAndUpdate(contentId, pipeline);
        break;
      }
    }
  } catch (error) {
    logger.error("Error updating content reactions count", error);
  }
};

export const sanitizePostText = (text: string): string => {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "recursiveEscape",
  });
};
