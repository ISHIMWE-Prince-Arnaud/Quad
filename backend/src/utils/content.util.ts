import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";

import type { ReactableContentType } from "../types/reaction.types.js";
import type { CommentableContentType } from "../types/comment.types.js";

/**
 * Verify that content exists for reactions
 */
export const verifyReactableContent = async (
  contentType: ReactableContentType,
  contentId: string
): Promise<{ exists: boolean; content?: any }> => {
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
      case "comment":
        // Comments can be reacted to
        const { Comment } = await import("../models/Comment.model.js");
        content = await Comment.findById(contentId);
        break;
      default:
        return { exists: false };
    }

    return { exists: !!content, content };
  } catch (error) {
    console.error("Error verifying reactable content:", error);
    return { exists: false };
  }
};

/**
 * Verify that content exists for comments
 */
export const verifyCommentableContent = async (
  contentType: CommentableContentType,
  contentId: string
): Promise<{ exists: boolean; content?: any }> => {
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
    console.error("Error verifying commentable content:", error);
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
    console.error("Error updating content comments count:", error);
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
    switch (contentType) {
      case "post":
        await Post.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
        break;
      case "story":
        await Story.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
        break;
      case "poll":
        await Poll.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
        break;
      case "comment":
        // Comments can have reactions too - update if Comment model has reactionsCount field
        const { Comment } = await import("../models/Comment.model.js");
        await Comment.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
        break;
    }
  } catch (error) {
    console.error("Error updating content reactions count:", error);
  }
};
