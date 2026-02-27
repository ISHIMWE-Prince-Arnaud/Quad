import { ChatMessage } from "../models/ChatMessage.model.js";
import { User } from "../models/User.model.js";
import type {
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
import { findUserByUsername } from "../utils/userLookup.util.js";
import { AppError } from "../utils/appError.util.js";

export class ChatService {
  static async sendMessage(
    userId: string,
    messageData: CreateMessageSchemaType,
  ) {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const sanitizedText = sanitizeMessageText(messageData.text);
    if (!sanitizedText) {
      throw new AppError("Message must have text", 400);
    }
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
      text: sanitizedText,
      mentions,
      isEdited: false,
    });

    const formattedMessage = formatMessageResponse(message);

    if (mentions && mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        const mentionedUser = await findUserByUsername(mentionedUsername);
        if (mentionedUser && mentionedUser.clerkId !== userId) {
          await createNotification({
            userId: mentionedUser.clerkId,
            type: "chat_mention",
            actorId: userId,
            contentId: message.id,
            contentType: "ChatMessage",
            message: generateNotificationMessage("chat_mention", user.username),
          });
        }
      }
    }

    getSocketIO().to("chat:global").emit("chat:message:new", formattedMessage);

    return formattedMessage;
  }

  static async getMessages(
    userId: string | undefined,
    query: GetMessagesQuerySchemaType,
  ) {
    const { page, limit, before } = query;

    const filter: Record<string, unknown> = {};

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

    const formattedMessages = messages.map((message) =>
      formatMessageResponse(message),
    );

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

  static async editMessage(
    userId: string,
    id: string,
    updates: UpdateMessageSchemaType,
  ) {
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
      if (sanitizedText === undefined) {
        throw new AppError("Message must have text after editing", 400);
      }
      if (sanitizedText !== message.text) {
        message.text = sanitizedText;
        message.mentions = extractMentions(sanitizedText);
        hasChanges = true;
      }
    }

    if (!message.text) {
      throw new AppError("Message must have text after editing", 400);
    }

    if (hasChanges) {
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const formattedMessage = formatMessageResponse(message);
      getSocketIO()
        .to("chat:global")
        .emit("chat:message:edited", formattedMessage);

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

    await ChatMessage.findByIdAndDelete(id);

    getSocketIO().to("chat:global").emit("chat:message:deleted", id);
  }
}
