import type { Request, Response } from "express";
import { Comment } from "../models/Comment.model.js";
import { CommentLike } from "../models/CommentLike.model.js";
import { User } from "../models/User.model.js";
import type {
  CreateCommentSchemaType,
  UpdateCommentSchemaType,
} from "../schemas/comment.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  verifyCommentableContent,
  updateContentCommentsCount,
} from "../utils/content.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { DatabaseService } from "../services/database.service.js";
import { logger } from "../utils/logger.util.js";

// =========================
// CREATE COMMENT
// =========================
export const createComment = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId, text, parentId } =
      req.body as CreateCommentSchemaType;
    const userId = req.auth.userId;

    // Verify content exists
    const { exists, content } = await verifyCommentableContent(
      contentType,
      contentId
    );
    if (!exists || !content) {
      return res
        .status(404)
        .json({ success: false, message: `${contentType} not found` });
    }

    // Get user data
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Get content owner ID
    const contentOwnerId = content.userId || content.clerkId;

    // If this is a reply, verify parent comment exists
    let parentComment = null;
    if (parentId) {
      parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ success: false, message: "Parent comment not found" });
      }

      // Increment parent's replies count
      await Comment.findByIdAndUpdate(parentId, { $inc: { repliesCount: 1 } });
    }

    // Create comment
    const newComment = await Comment.create({
      contentType,
      contentId,
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      text,
      parentId: parentId || undefined,
      reactionsCount: 0,
      likesCount: 0,
      repliesCount: 0,
    });

    // Update content comments count
    await updateContentCommentsCount(contentType, contentId, 1);

    // Create notifications
    if (parentId && parentComment) {
      // This is a reply - notify parent comment author
      const parentAuthorId = parentComment.author.clerkId;
      if (parentAuthorId !== userId) {
        await createNotification({
          userId: parentAuthorId,
          type: "comment_reply",
          actorId: userId,
          contentId: parentId,
          contentType: "Comment",
          message: generateNotificationMessage("comment_reply", user.username),
        });
      }
    } else {
      // This is a top-level comment - notify content owner
      if (contentOwnerId && contentOwnerId !== userId) {
        const notificationType =
          contentType === "post"
            ? "comment_post"
            : contentType === "story"
            ? "comment_story"
            : "comment_poll";

        await createNotification({
          userId: contentOwnerId,
          type: notificationType as any,
          actorId: userId,
          contentId,
          contentType:
            contentType === "post"
              ? "Post"
              : contentType === "story"
              ? "Story"
              : "Poll",
          message: generateNotificationMessage(
            notificationType,
            user.username,
            contentType
          ),
        });
      }
    }

    // Emit real-time event
    getSocketIO().emit("commentAdded", {
      contentType,
      contentId,
      parentId,
      comment: newComment,
    });

    return res.status(201).json({
      success: true,
      message: "Comment added",
      data: newComment,
    });
  } catch (error: any) {
    logger.error("Error creating comment", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET COMMENTS BY CONTENT (Optimized to prevent N+1 queries)
// =========================
export const getCommentsByContent = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params;
    const { limit = "20", skip = "0", parentId } = req.query;

    // Build query - if parentId is provided, get replies; otherwise get top-level comments
    const query: any = { contentType, contentId };
    if (parentId === "null" || !parentId) {
      query.parentId = { $exists: false };
    } else {
      query.parentId = parentId;
    }

    // Use populate to get author data in single query (prevents N+1)
    const comments = await Comment.find(query)
      .populate("author", "username displayName profileImage")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Comment.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + comments.length < total,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching comments", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET COMMENT BY ID
// =========================
export const getComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    return res.status(200).json({ success: true, data: comment });
  } catch (error: any) {
    logger.error("Error fetching comment", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET REPLIES TO COMMENT
// =========================
export const getReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "10", skip = "0" } = req.query;

    const replies = await Comment.find({ parentId: id })
      .sort({ createdAt: 1 }) // Oldest first for replies
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Comment.countDocuments({ parentId: id });

    return res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + replies.length < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching replies:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE COMMENT
// =========================
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body as UpdateCommentSchemaType;
    const userId = req.auth.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Only author can update
    if (comment.author.clerkId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    comment.text = text;
    await comment.save();

    // Emit real-time event
    getSocketIO().emit("commentUpdated", {
      contentType: comment.contentType,
      contentId: comment.contentId,
      commentId: id,
      comment,
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated",
      data: comment,
    });
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE COMMENT
// =========================
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Only author can delete
    if (comment.author.clerkId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // If this is a top-level comment, decrement content's comment count
    if (!comment.parentId) {
      await updateContentCommentsCount(
        comment.contentType,
        comment.contentId,
        -1
      );
    } else {
      // If this is a reply, decrement parent's replies count
      await Comment.findByIdAndUpdate(comment.parentId, {
        $inc: { repliesCount: -1 },
      });
    }

    // Delete all replies to this comment (cascade)
    const deletedReplies = await Comment.deleteMany({ parentId: id });

    // Update content comment count for deleted replies
    if (deletedReplies.deletedCount > 0) {
      await updateContentCommentsCount(
        comment.contentType,
        comment.contentId,
        -deletedReplies.deletedCount
      );
    }

    // Delete all likes on this comment
    await CommentLike.deleteMany({ commentId: id });

    // Delete the comment itself
    await Comment.findByIdAndDelete(id);

    // Emit real-time event
    getSocketIO().emit("commentDeleted", {
      contentType: comment.contentType,
      contentId: comment.contentId,
      commentId: id,
      parentId: comment.parentId,
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// TOGGLE COMMENT LIKE
// =========================
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.body;
    const userId = req.auth.userId;

    // Verify comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Get user data
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user already liked this comment
    const existingLike = await CommentLike.findOne({ commentId, userId });

    if (existingLike) {
      // Unlike
      await CommentLike.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });

      // Emit real-time event
      getSocketIO().emit("commentLikeRemoved", {
        commentId,
        userId,
        likesCount: comment.likesCount - 1,
      });

      return res.status(200).json({
        success: true,
        message: "Like removed",
        liked: false,
        likesCount: comment.likesCount - 1,
      });
    }

    // Like
    const newLike = await CommentLike.create({
      commentId,
      userId,
      username: user.username,
    });

    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

    // Emit real-time event
    getSocketIO().emit("commentLikeAdded", {
      commentId,
      userId,
      likesCount: comment.likesCount + 1,
    });

    return res.status(201).json({
      success: true,
      message: "Like added",
      liked: true,
      likesCount: comment.likesCount + 1,
      data: newLike,
    });
  } catch (error: any) {
    console.error("Error toggling comment like:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET COMMENT LIKES
// =========================
export const getCommentLikes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const likes = await CommentLike.find({ commentId: id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: likes,
      count: likes.length,
    });
  } catch (error: any) {
    console.error("Error fetching comment likes:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
