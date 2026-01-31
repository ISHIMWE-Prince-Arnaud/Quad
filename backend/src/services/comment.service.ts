import { Comment } from "../models/Comment.model.js";
import { CommentLike } from "../models/CommentLike.model.js";
import { User } from "../models/User.model.js";
import type { CommentableContentType } from "../types/comment.types.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitEngagementUpdate } from "../sockets/feed.socket.js";
import {
  verifyCommentableContent,
  updateContentCommentsCount,
} from "../utils/content.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { extractMentions } from "../utils/chat.util.js";
import { findUserByUsername } from "../utils/userLookup.util.js";
import { getPaginatedData } from "../utils/pagination.util.js";
import { AppError } from "../utils/appError.util.js";

export interface CreateCommentInput {
  contentType: CommentableContentType;
  contentId: string;
  text: string;
}

export class CommentService {
  private static async getContentEngagementCounts(
    contentType: "post" | "story",
    contentId: string,
  ): Promise<{
    reactionsCount: number;
    commentsCount: number;
    votes?: number;
  }> {
    if (contentType === "post") {
      const { Post } = await import("../models/Post.model.js");
      const post = await Post.findById(contentId).select(
        "reactionsCount commentsCount",
      );
      return {
        reactionsCount: post?.reactionsCount ?? 0,
        commentsCount: post?.commentsCount ?? 0,
      };
    }

    const { Story } = await import("../models/Story.model.js");
    const story = await Story.findById(contentId).select(
      "reactionsCount commentsCount",
    );
    return {
      reactionsCount: story?.reactionsCount ?? 0,
      commentsCount: story?.commentsCount ?? 0,
    };
  }

  static async createComment(userId: string, data: CreateCommentInput) {
    const { contentType, contentId, text } = data;

    const { exists, content } = await verifyCommentableContent(
      contentType,
      contentId,
    );
    if (!exists || !content) {
      throw new AppError(`${contentType} not found`, 404);
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const contentObj = content as unknown as Record<string, unknown>;
    const contentOwnerId =
      (typeof contentObj.userId === "string" ? contentObj.userId : undefined) ||
      (typeof contentObj.clerkId === "string" ? contentObj.clerkId : undefined);

    const newComment = await Comment.create({
      contentType,
      contentId,
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        ...(user.profileImage !== undefined
          ? { profileImage: user.profileImage }
          : {}),
      },
      text,
      reactionsCount: 0,
      likesCount: 0,
    });

    const mentions = extractMentions(text);
    if (mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        const mentionedUser = await findUserByUsername(mentionedUsername);
        if (mentionedUser && mentionedUser.clerkId !== userId) {
          await createNotification({
            userId: mentionedUser.clerkId,
            type: "mention_comment",
            actorId: userId,
            contentId,
            contentType: contentType === "post" ? "Post" : "Story",
            message: generateNotificationMessage(
              "mention_comment",
              user.username,
            ),
          });
        }
      }
    }

    await updateContentCommentsCount(contentType, contentId, 1);

    if (contentOwnerId && contentOwnerId !== userId) {
      const notificationType =
        contentType === "post" ? "comment_post" : "comment_story";

      await createNotification({
        userId: contentOwnerId,
        type: notificationType,
        actorId: userId,
        contentId,
        contentType: contentType === "post" ? "Post" : "Story",
        message: generateNotificationMessage(
          notificationType,
          user.username,
          contentType,
        ),
      });
    }

    const io = getSocketIO();
    io.emit("commentAdded", {
      contentType,
      contentId,
      comment: newComment,
    });

    try {
      const counts = await this.getContentEngagementCounts(
        contentType,
        contentId,
      );
      emitEngagementUpdate(
        io,
        contentType,
        contentId,
        counts.reactionsCount,
        counts.commentsCount,
        counts.votes,
      );
    } catch {
      // best-effort
    }

    return newComment;
  }

  static async getCommentsByContent(
    contentType: string,
    contentId: string,
    opts: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 20 } = opts;
    const query = { contentType, contentId };

    return getPaginatedData(Comment, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: "author", select: "username displayName profileImage" },
    });
  }

  static async getComment(id: string) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    return comment;
  }

  static async updateComment(userId: string, id: string, text: string) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.author.clerkId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    comment.text = text;
    await comment.save();

    getSocketIO().emit("commentUpdated", {
      contentType: comment.contentType,
      contentId: comment.contentId,
      commentId: id,
      comment,
    });

    return comment;
  }

  static async deleteComment(userId: string, id: string) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.author.clerkId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    await updateContentCommentsCount(
      comment.contentType,
      comment.contentId,
      -1,
    );

    await CommentLike.deleteMany({ commentId: id });
    await Comment.findByIdAndDelete(id);

    const io = getSocketIO();
    io.emit("commentDeleted", {
      contentType: comment.contentType,
      contentId: comment.contentId,
      commentId: id,
    });

    try {
      const counts = await this.getContentEngagementCounts(
        comment.contentType,
        comment.contentId,
      );
      emitEngagementUpdate(
        io,
        comment.contentType,
        comment.contentId,
        counts.reactionsCount,
        counts.commentsCount,
        counts.votes,
      );
    } catch {
      // best-effort
    }
  }

  static async toggleCommentLike(userId: string, commentId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingLike = await CommentLike.findOne({ commentId, userId });

    if (existingLike) {
      await CommentLike.deleteOne({ _id: existingLike._id });
      await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });

      getSocketIO().emit("commentLikeRemoved", {
        commentId,
        userId,
        likesCount: comment.likesCount - 1,
      });

      return {
        statusCode: 200,
        body: {
          success: true,
          message: "Like removed",
          liked: false,
          likesCount: comment.likesCount - 1,
        },
      };
    }

    const newLike = await CommentLike.create({
      commentId,
      userId,
      username: user.username,
    });

    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

    getSocketIO().emit("commentLikeAdded", {
      commentId,
      userId,
      likesCount: comment.likesCount + 1,
    });

    return {
      statusCode: 201,
      body: {
        success: true,
        message: "Like added",
        liked: true,
        likesCount: comment.likesCount + 1,
        data: newLike,
      },
    };
  }

  static async getCommentLikes(commentId: string) {
    const likes = await CommentLike.find({ commentId }).sort({ createdAt: -1 });
    return likes;
  }
}
