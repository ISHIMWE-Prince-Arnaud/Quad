import { endpoints } from "@/lib/api";
import type {
  ChatMessagesResponse,
  ChatEditMessageResponse,
  ChatSendMessageResponse,
  ChatDeleteMessageResponse,
  ChatAddReactionResponse,
  ChatRemoveReactionResponse,
  ChatMarkAsReadResponse,
} from "@/types/chat";

export class ChatService {
  static async sendMessage(data: {
    text?: string;
  }): Promise<ChatSendMessageResponse> {
    const response = await endpoints.chat.sendMessage(data);
    return response.data as ChatSendMessageResponse;
  }

  static async getMessages(params?: {
    page?: number;
    limit?: number;
    before?: string;
  }): Promise<ChatMessagesResponse> {
    const response = await endpoints.chat.getMessages(params);
    return response.data as ChatMessagesResponse;
  }

  static async editMessage(
    id: string,
    data: { text?: string }
  ): Promise<ChatEditMessageResponse> {
    const response = await endpoints.chat.editMessage(id, data);
    return response.data as ChatEditMessageResponse;
  }

  static async deleteMessage(id: string): Promise<ChatDeleteMessageResponse> {
    const response = await endpoints.chat.deleteMessage(id);
    return response.data as ChatDeleteMessageResponse;
  }

  static async addReaction(
    id: string,
    emoji: string
  ): Promise<ChatAddReactionResponse> {
    const response = await endpoints.chat.addReaction(id, { emoji });
    return response.data as ChatAddReactionResponse;
  }

  static async removeReaction(id: string): Promise<ChatRemoveReactionResponse> {
    const response = await endpoints.chat.removeReaction(id);
    return response.data as ChatRemoveReactionResponse;
  }

  static async markAsRead(
    lastReadMessageId: string
  ): Promise<ChatMarkAsReadResponse> {
    const response = await endpoints.chat.markAsRead({ lastReadMessageId });
    return response.data as ChatMarkAsReadResponse;
  }
}
