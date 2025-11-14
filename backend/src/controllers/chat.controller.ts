/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { ChatMessage } from "../models/ChatMessage.model.js";
import { MessageReaction } from "../models/MessageReaction.model.js";
import { User } from "../models/User.model.js";
import type {
  CreateMessageSchemaType,
  UpdateMessageSchemaType,
  AddReactionSchemaType,
  GetMessagesQuerySchemaType,
} from "../schemas/chat.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  extractMentions,
  formatMessageResponse,
  sanitizeMessageText,
} from "../utils/chat.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";

// =========================
// SEND MESSAGE
// =========================
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.auth().userId;
    const messageData = req.body as CreateMessageSchemaType;

    // Get user info
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Sanitize text
    const sanitizedText = sanitizeMessageText(messageData.text);

    // Extract mentions from text
    const mentions = extractMentions(sanitizedText);

    // Create message
    const message = await ChatMessage.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      text: sanitizedText,
      media: messageData.media,
      mentions,
      reactionsCount: 0,
      isEdited: false,
    });

    // Format response
    const formattedMessage = formatMessageResponse(message);

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        // Find mentioned user
        const mentionedUser = await User.findOne({
          username: mentionedUsername,
        });
        if (mentionedUser && mentionedUser.clerkId !== userId) {
          await createNotification({
            userId: mentionedUser.clerkId,
            type: "chat_mention",
            actorId: userId,
            contentId: (message._id as any).toString(),
            contentType: "ChatMessage",
            message: generateNotificationMessage("chat_mention", user.username),
          });
        }
      }
    }

    // Emit real-time event
    getSocketIO().emit("chat:message:new", formattedMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: formattedMessage,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET MESSAGES
// =========================
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.auth()?.userId;
    const query = req.query as unknown as GetMessagesQuerySchemaType;
    const { page, limit, before } = query;

    // Build filter
    const filter: any = {};

    // If "before" is provided, get messages before that ID
    if (before) {
      const beforeMessage = await ChatMessage.findById(before);
      if (beforeMessage) {
        filter.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get messages (newest first)
    const [messages, total] = await Promise.all([
      ChatMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ChatMessage.countDocuments(filter),
    ]);

    // Get user's reactions if logged in
    let userReactions: any = {};
    if (userId) {
      const reactions = await MessageReaction.find({
        userId,
        messageId: { $in: messages.map((m) => m._id) },
      });
      userReactions = Object.fromEntries(
        reactions.map((r) => [r.messageId.toString(), r])
      );
    }

    // Format messages with user reactions
    const formattedMessages = messages.map((message) => {
      const messageId = message._id ? message._id.toString() : "";
      const userReaction = userReactions[messageId];
      return formatMessageResponse(message, userReaction);
    });

    return res.json({
      success: true,
      data: formattedMessages.reverse(), // Reverse to oldest-first for display
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// EDIT MESSAGE
// =========================
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;
    const updates = req.body as UpdateMessageSchemaType;

    // Find message
    const message = await ChatMessage.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Only author can edit
    if (message.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can edit this message",
      });
    }

    // Apply updates
    let hasChanges = false;

    if (updates.text !== undefined) {
      const sanitizedText = sanitizeMessageText(updates.text);
      if (sanitizedText !== message.text) {
        message.text = sanitizedText as any;
        message.mentions = extractMentions(sanitizedText);
        hasChanges = true;
      }
    }

    if (updates.media !== undefined) {
      if (updates.media === null) {
        // Remove media
        message.media = undefined as any;
        hasChanges = true;
      } else if (
        JSON.stringify(updates.media) !== JSON.stringify(message.media)
      ) {
        // Update media
        message.media = updates.media as any;
        hasChanges = true;
      }
    }

    // Ensure message has valid content after edit
    if (!message.text && !message.media) {
      return res.status(400).json({
        success: false,
        message: "Message must have text or media after editing",
      });
    }

    if (hasChanges) {
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      // Format response
      const formattedMessage = formatMessageResponse(message);

      // Emit real-time event
      getSocketIO().emit("chat:message:edited", formattedMessage);

      return res.json({
        success: true,
        message: "Message edited successfully",
        data: formattedMessage,
      });
    }

    return res.json({
      success: true,
      message: "No changes made",
      data: formatMessageResponse(message),
    });
  } catch (error: any) {
    console.error("Error editing message:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE MESSAGE
// =========================
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;

    // Find message
    const message = await ChatMessage.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Only author can delete
    if (message.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can delete this message",
      });
    }

    // Delete message and all reactions
    await Promise.all([
      ChatMessage.findByIdAndDelete(id),
      MessageReaction.deleteMany({ messageId: id }),
    ]);

    // Emit real-time event
    getSocketIO().emit("chat:message:deleted", id);

    return res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// ADD REACTION
// =========================
export const addReaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;
    const { emoji } = req.body as AddReactionSchemaType;

    // Find message
    const message = await ChatMessage.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await MessageReaction.findOne({
      messageId: id,
      userId,
      emoji,
    });

    if (existingReaction) {
      return res.status(400).json({
        success: false,
        message: "You have already reacted with this emoji",
      });
    }

    // Remove any existing reaction from this user on this message
    await MessageReaction.deleteMany({ messageId: id, userId });

    // Create new reaction
    const reaction = await MessageReaction.create({
      messageId: id,
      userId,
      emoji,
    });

    // Update message reaction count
    const reactionCount = await MessageReaction.countDocuments({
      messageId: id,
    });
    message.reactionsCount = reactionCount;
    await message.save();

    // Emit real-time event
    getSocketIO().emit("chat:reaction:added", {
      messageId: id,
      emoji,
      reactionsCount: reactionCount,
    });

    return res.json({
      success: true,
      message: "Reaction added successfully",
      data: {
        emoji: reaction.emoji,
        reactionsCount: message.reactionsCount,
      },
    });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// REMOVE REACTION
// =========================
export const removeReaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth().userId;

    // Find message
    const message = await ChatMessage.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Find and delete user's reaction
    const reaction = await MessageReaction.findOneAndDelete({
      messageId: id,
      userId,
    });

    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: "No reaction found",
      });
    }

    // Update message reaction count
    const reactionCount = await MessageReaction.countDocuments({
      messageId: id,
    });
    message.reactionsCount = reactionCount;
    await message.save();

    // Emit real-time event
    getSocketIO().emit("chat:reaction:removed", {
      messageId: id,
      reactionsCount: reactionCount,
    });

    return res.json({
      success: true,
      message: "Reaction removed successfully",
      data: {
        reactionsCount: message.reactionsCount,
      },
    });
  } catch (error: any) {
    console.error("Error removing reaction:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// MARK AS READ
// =========================
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.auth().userId;
    const { lastReadMessageId } = req.body;

    // Verify message exists
    const message = await ChatMessage.findById(lastReadMessageId);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // In a real app, you'd store this in a UserReadReceipt model or similar
    // For now, we'll just return success
    // You can extend this to track read receipts per user

    return res.json({
      success: true,
      message: "Messages marked as read",
      data: {
        lastReadMessageId,
        readAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error marking as read:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
