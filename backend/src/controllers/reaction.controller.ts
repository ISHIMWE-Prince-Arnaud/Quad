import type { Request, Response } from "express";
import { Reaction } from "../models/Reaction.model.js";
import { User } from "../models/User.model.js";
import type { CreateReactionSchemaType } from "../schemas/reaction.schema.js";
import type { ReactableContentType } from "../types/reaction.types.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitEngagementUpdate } from "../sockets/feed.socket.js";
import {
  verifyReactableContent,
  updateContentReactionsCount,
} from "../utils/content.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { DatabaseService } from "../services/database.service.js";
import { logger } from "../utils/logger.util.js";

const getEngagementSnapshot = async (
  contentType: ReactableContentType,
  contentId: string
): Promise<{ commentsCount: number; votes?: number }> => {
  if (contentType === "poll") {
    const { Poll } = await import("../models/Poll.model.js");
    const poll = await Poll.findById(contentId).select("commentsCount totalVotes");
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
};

// =========================
// CREATE OR UPDATE REACTION
// =========================
export const toggleReaction = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId, type } =
      req.body as CreateReactionSchemaType;
    const userId = req.auth.userId;

    // Verify content exists
    const { exists, content } = await verifyReactableContent(
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

    // Check if user already reacted to this content
    const existingReaction = await Reaction.findOne({
      contentType,
      contentId,
      userId,
    });

    if (existingReaction) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction.type === type) {
        await Reaction.deleteOne({ _id: existingReaction._id });

        // Update content's cached reaction count
        await updateContentReactionsCount(contentType, contentId, -1);

        // Get updated reaction count
        const reactionCount = await Reaction.countDocuments({
          contentType,
          contentId,
        });

        // Emit real-time event
        const io = getSocketIO();
        io.emit("reactionRemoved", {
          contentType,
          contentId,
          userId,
          reactionCount,
        });

        if (contentType === "post" || contentType === "story" || contentType === "poll") {
          const snapshot = await getEngagementSnapshot(contentType, contentId);
          emitEngagementUpdate(
            io,
            contentType,
            contentId,
            reactionCount,
            snapshot.commentsCount,
            snapshot.votes
          );
        }

        return res.status(200).json({
          success: true,
          message: "Reaction removed",
          data: null,
          reactionCount,
        });
      } else {
        // Update to new reaction type
        existingReaction.type = type;
        await existingReaction.save();

        // Emit real-time event
        getSocketIO().emit("reactionUpdated", {
          contentType,
          contentId,
          userId,
          type,
          reaction: existingReaction,
        });

        return res.status(200).json({
          success: true,
          message: "Reaction updated",
          data: existingReaction,
        });
      }
    }

    // Create new reaction
    const newReaction = await Reaction.create({
      contentType,
      contentId,
      userId,
      username: user.username,
      profileImage: user.profileImage,
      type,
    });

    // Update content's cached reaction count
    await updateContentReactionsCount(contentType, contentId, 1);

    // Get updated reaction count
    const reactionCount = await Reaction.countDocuments({
      contentType,
      contentId,
    });

    // Create notification for content owner (if not reacting to own content)
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

    // Emit real-time event
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
      const snapshot = await getEngagementSnapshot(contentType, contentId);
      emitEngagementUpdate(
        io,
        contentType,
        contentId,
        reactionCount,
        snapshot.commentsCount,
        snapshot.votes
      );
    }

    return res.status(201).json({
      success: true,
      message: "Reaction added",
      data: newReaction,
      reactionCount,
    });
  } catch (error: any) {
    logger.error("Error toggling reaction", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET REACTIONS BY CONTENT (Optimized to prevent N+1 queries)
// =========================
export const getReactionsByContent = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params as {
      contentType: ReactableContentType;
      contentId: string;
    };

    // Get all reactions
    const reactions = await Reaction.find({ contentType, contentId }).sort({
      createdAt: -1,
    });

    // Aggregate reactions by type for counts
    const reactionCounts = await Reaction.aggregate([
      { $match: { contentType, contentId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    // Check if current user has reacted
    const userId = req.auth?.userId;
    const userReaction = userId
      ? await Reaction.findOne({ contentType, contentId, userId })
      : null;

    return res.status(200).json({
      success: true,
      data: {
        reactions,
        reactionCounts,
        userReaction,
        totalCount: reactions.length,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching reactions", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET USER'S REACTIONS
// =========================
export const getUserReactions = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { limit = "20", skip = "0" } = req.query;

    const reactions = await Reaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Reaction.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      data: reactions,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + reactions.length < total,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user reactions", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE REACTION (Alternative to toggle)
// =========================
export const deleteReaction = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params as {
      contentType: ReactableContentType;
      contentId: string;
    };
    const userId = req.auth.userId;

    const reaction = await Reaction.findOneAndDelete({
      contentType,
      contentId,
      userId,
    });

    if (!reaction) {
      return res
        .status(404)
        .json({ success: false, message: "Reaction not found" });
    }

    // Update content's cached reaction count
    await updateContentReactionsCount(contentType, contentId, -1);

    // Update reaction count
    const reactionCount = await Reaction.countDocuments({
      contentType,
      contentId,
    });

    // Emit real-time event
    getSocketIO().emit("reactionRemoved", {
      contentType,
      contentId,
      userId,
      reactionCount,
    });

    return res.status(200).json({
      success: true,
      message: "Reaction removed",
      reactionCount,
    });
  } catch (error: any) {
    logger.error("Error deleting reaction", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
