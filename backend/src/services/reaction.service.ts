import { Reaction } from "../models/Reaction.model.js";
import { User } from "../models/User.model.js";
import type { ReactableContentType } from "../types/reaction.types.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitEngagementUpdate } from "../sockets/feed.socket.js";
import {
  verifyReactableContent,
  updateContentReactionsCount,
  setContentReactionsCount,
} from "../utils/content.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { AppError } from "../utils/appError.util.js";

export interface ToggleReactionInput {
  contentType: ReactableContentType;
  contentId: string;
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
}

export class ReactionService {
  private static async getEngagementSnapshot(
    contentType: ReactableContentType,
    contentId: string
  ): Promise<{ commentsCount: number; votes?: number }> {
    if (contentType === "poll") {
      const { Poll } = await import("../models/Poll.model.js");
      const poll = await Poll.findById(contentId).select(
        "commentsCount totalVotes"
      );
      return {
        commentsCount: poll?.commentsCount ?? 0,
        votes: poll?.totalVotes ?? 0,
      };
    }

    if (contentType === "post") {
      const { Post } = await import("../models/Post.model.js");
      const post = await Post.findById(contentId).select("commentsCount");
      return { commentsCount: post?.commentsCount ?? 0 };
    }

    if (contentType === "story") {
      const { Story } = await import("../models/Story.model.js");
      const story = await Story.findById(contentId).select("commentsCount");
      return { commentsCount: story?.commentsCount ?? 0 };
    }

    return { commentsCount: 0 };
  }

  static async toggleReaction(userId: string, data: ToggleReactionInput) {
    const { contentType, contentId, type } = data;

    const { exists, content } = await verifyReactableContent(
      contentType,
      contentId
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

    const existingReaction = await Reaction.findOne({
      contentType,
      contentId,
      userId,
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await Reaction.deleteOne({ _id: existingReaction._id });

        await updateContentReactionsCount(contentType, contentId, -1);

        const reactionCount = await Reaction.countDocuments({
          contentType,
          contentId,
        });

        await setContentReactionsCount(contentType, contentId, reactionCount);

        const io = getSocketIO();
        io.emit("reactionRemoved", {
          contentType,
          contentId,
          userId,
          reactionCount,
        });

        if (
          contentType === "post" ||
          contentType === "story" ||
          contentType === "poll"
        ) {
          const snapshot = await this.getEngagementSnapshot(
            contentType,
            contentId
          );
          emitEngagementUpdate(
            io,
            contentType,
            contentId,
            reactionCount,
            snapshot.commentsCount,
            snapshot.votes
          );
        }

        return {
          statusCode: 200,
          body: {
            success: true,
            message: "Reaction removed",
            data: null,
            reactionCount,
          },
        };
      }

      existingReaction.type = type;
      await existingReaction.save();

      getSocketIO().emit("reactionUpdated", {
        contentType,
        contentId,
        userId,
        type,
        reaction: existingReaction,
      });

      return {
        statusCode: 200,
        body: {
          success: true,
          message: "Reaction updated",
          data: existingReaction,
        },
      };
    }

    const newReaction = await Reaction.create({
      contentType,
      contentId,
      userId,
      username: user.username,
      ...(user.profileImage !== undefined
        ? { profileImage: user.profileImage }
        : {}),
      type,
    });

    await updateContentReactionsCount(contentType, contentId, 1);

    const reactionCount = await Reaction.countDocuments({
      contentType,
      contentId,
    });

    await setContentReactionsCount(contentType, contentId, reactionCount);

    if (contentOwnerId && contentOwnerId !== userId) {
      const notificationType =
        contentType === "post"
          ? "reaction_post"
          : contentType === "story"
            ? "reaction_story"
            : contentType === "poll"
              ? "reaction_poll"
              : "reaction_post";

      await createNotification({
        userId: contentOwnerId,
        type: notificationType,
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

    const io = getSocketIO();
    io.emit("reactionAdded", {
      contentType,
      contentId,
      userId,
      type,
      reaction: newReaction,
      reactionCount,
    });

    if (contentType === "post" || contentType === "story" || contentType === "poll") {
      const snapshot = await this.getEngagementSnapshot(contentType, contentId);
      emitEngagementUpdate(
        io,
        contentType,
        contentId,
        reactionCount,
        snapshot.commentsCount,
        snapshot.votes
      );
    }

    return {
      statusCode: 201,
      body: {
        success: true,
        message: "Reaction added",
        data: newReaction,
        reactionCount,
      },
    };
  }

  static async getReactionsByContent(
    contentType: ReactableContentType,
    contentId: string,
    userId?: string
  ) {
    const reactions = await Reaction.find({ contentType, contentId }).sort({
      createdAt: -1,
    });

    const reactionCounts = await Reaction.aggregate([
      { $match: { contentType, contentId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    const userReaction = userId
      ? await Reaction.findOne({ contentType, contentId, userId })
      : null;

    return {
      reactions,
      reactionCounts,
      userReaction,
      totalCount: reactions.length,
    };
  }

  static async getUserReactions(userId: string, limit = "20", skip = "0") {
    const reactions = await Reaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Reaction.countDocuments({ userId });

    return {
      reactions,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + reactions.length < total,
      },
    };
  }

  static async deleteReaction(
    userId: string,
    contentType: ReactableContentType,
    contentId: string
  ) {
    const reaction = await Reaction.findOneAndDelete({
      contentType,
      contentId,
      userId,
    });

    if (!reaction) {
      throw new AppError("Reaction not found", 404);
    }

    await updateContentReactionsCount(contentType, contentId, -1);

    const reactionCount = await Reaction.countDocuments({
      contentType,
      contentId,
    });

    await setContentReactionsCount(contentType, contentId, reactionCount);

    getSocketIO().emit("reactionRemoved", {
      contentType,
      contentId,
      userId,
      reactionCount,
    });

    return reactionCount;
  }
}
