import { ChatMessage } from "../models/ChatMessage.model.js";
import { MessageReaction } from "../models/MessageReaction.model.js";
import { User } from "../models/User.model.js";
import type {
  AddReactionSchemaType,
  CreateMessageSchemaType,
  GetMessagesQuerySchemaType,
  UpdateMessageSchemaType,
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
import { findUserByUsernameOrAlias } from "../utils/userLookup.util.js";
import { AppError } from "../utils/appError.util.js";

export class ChatService {
  static async sendMessage(userId: string, messageData: CreateMessageSchemaType) {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const sanitizedText = sanitizeMessageText(messageData.text);
    const mentions = extractMentions(sanitizedText);

    const message = await ChatMessage.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        ...(user.profileImage !== undefined
          ? { profileImage: user.profileImage }
          : {}),
        ...(user.bio !== undefined ? { bio: user.bio } : {}),
      },
      ...(sanitizedText !== undefined ? { text: sanitizedText } : {}),
      ...(messageData.media !== undefined ? { media: messageData.media } : {}),
      mentions,
      reactionsCount: 0,
      isEdited: false,
    });

    const formattedMessage = formatMessageResponse(message);

    if (mentions && mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        const mentionedUser = await findUserByUsernameOrAlias(mentionedUsername);
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

    getSocketIO().emit("chat:message:new", formattedMessage);

    return formattedMessage;
  }

  static async getMessages(userId: string | undefined, query: GetMessagesQuerySchemaType) {
    const { page, limit, before } = query;

    const filter: any = {};

    if (before) {
      const beforeMessage = await ChatMessage.findById(before);
      if (beforeMessage) {
        filter.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ChatMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ChatMessage.countDocuments(filter),
    ]);

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

    const formattedMessages = messages.map((message) => {
      const messageId = message._id ? message._id.toString() : "";
      const userReaction = userReactions[messageId];
      return formatMessageResponse(message, userReaction);
    });

    return {
      messages: formattedMessages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  static async editMessage(userId: string, id: string, updates: UpdateMessageSchemaType) {
    const message = await ChatMessage.findById(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.author.clerkId !== userId) {
      throw new AppError("Only the author can edit this message", 403);
    }

    let hasChanges = false;

    if (updates.text !== undefined) {
      const sanitizedText = sanitizeMessageText(updates.text);
      if (sanitizedText !== message.text) {
        (message as any).text = sanitizedText;
        message.mentions = extractMentions(sanitizedText);
        hasChanges = true;
      }
    }

    if (updates.media !== undefined) {
      if (updates.media === null) {
        (message as any).media = undefined;
        hasChanges = true;
      } else if (JSON.stringify(updates.media) !== JSON.stringify(message.media)) {
        (message as any).media = updates.media as any;
        hasChanges = true;
      }
    }

    if (!message.text && !message.media) {
      throw new AppError("Message must have text or media after editing", 400);
    }

    if (hasChanges) {
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const formattedMessage = formatMessageResponse(message);
      getSocketIO().emit("chat:message:edited", formattedMessage);

      return {
        message: "Message edited successfully",
        data: formattedMessage,
      };
    }

    return {
      message: "No changes made",
      data: formatMessageResponse(message),
    };
  }

  static async deleteMessage(userId: string, id: string) {
    const message = await ChatMessage.findById(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.author.clerkId !== userId) {
      throw new AppError("Only the author can delete this message", 403);
    }

    await Promise.all([
      ChatMessage.findByIdAndDelete(id),
      MessageReaction.deleteMany({ messageId: id }),
    ]);

    getSocketIO().emit("chat:message:deleted", id);
  }

  static async addReaction(userId: string, id: string, body: AddReactionSchemaType) {
    const { emoji } = body;

    const message = await ChatMessage.findById(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const existingReaction = await MessageReaction.findOne({
      messageId: id,
      userId,
      emoji,
    });

    if (existingReaction) {
      throw new AppError("You have already reacted with this emoji", 400);
    }

    await MessageReaction.deleteMany({ messageId: id, userId });

    const reaction = await MessageReaction.create({
      messageId: id,
      userId,
      emoji,
    });

    const reactionCount = await MessageReaction.countDocuments({ messageId: id });
    message.reactionsCount = reactionCount;
    await message.save();

    getSocketIO().emit("chat:reaction:added", {
      messageId: id,
      emoji,
      reactionsCount: reactionCount,
    });

    return {
      emoji: reaction.emoji,
      reactionsCount: message.reactionsCount,
    };
  }

  static async removeReaction(userId: string, id: string) {
    const message = await ChatMessage.findById(id);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    const reaction = await MessageReaction.findOneAndDelete({
      messageId: id,
      userId,
    });

    if (!reaction) {
      throw new AppError("No reaction found", 404);
    }

    const reactionCount = await MessageReaction.countDocuments({ messageId: id });
    message.reactionsCount = reactionCount;
    await message.save();

    getSocketIO().emit("chat:reaction:removed", {
      messageId: id,
      reactionsCount: reactionCount,
    });

    return {
      reactionsCount: message.reactionsCount,
    };
  }

  static async markAsRead(userId: string, lastReadMessageId: string) {
    const message = await ChatMessage.findById(lastReadMessageId);
    if (!message) {
      throw new AppError("Message not found", 404);
    }

    return {
      lastReadMessageId,
      readAt: new Date(),
    };
  }
}
