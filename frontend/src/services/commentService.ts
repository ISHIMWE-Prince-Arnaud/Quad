import { endpoints } from "@/lib/api";
import type { Comment } from "@/types/comment";

export class CommentService {
  static async getByContent(
    contentType: "post" | "story" | "poll",
    contentId: string,
    params?: { limit?: number; skip?: number; parentId?: string | null }
  ): Promise<{
    success: boolean;
    data: Comment[];
    pagination?: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    const response = await endpoints.comments.getByContent(
      contentType,
      contentId,
      params
    );
    return response.data as {
      success: boolean;
      data: Comment[];
      pagination?: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
      };
      message?: string;
    };
  }

  static async create(data: {
    contentType: "post" | "story" | "poll";
    contentId: string;
    text: string;
    parentId?: string;
  }): Promise<{
    success: boolean;
    data: Comment;
    message?: string;
  }> {
    const response = await endpoints.comments.create(data);
    return response.data as {
      success: boolean;
      data: Comment;
      message?: string;
    };
  }

  static async getById(id: string): Promise<{
    success: boolean;
    data: Comment;
    message?: string;
  }> {
    const response = await endpoints.comments.getById(id);
    return response.data as {
      success: boolean;
      data: Comment;
      message?: string;
    };
  }

  static async getReplies(
    id: string,
    params?: { limit?: number; skip?: number }
  ): Promise<{
    success: boolean;
    data: Comment[];
    pagination?: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    const response = await endpoints.comments.getReplies(id, params);
    return response.data as {
      success: boolean;
      data: Comment[];
      pagination?: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
      };
      message?: string;
    };
  }

  static async update(
    id: string,
    text: string
  ): Promise<{
    success: boolean;
    data: Comment;
    message?: string;
  }> {
    const response = await endpoints.comments.update(id, { text });
    return response.data as {
      success: boolean;
      data: Comment;
      message?: string;
    };
  }

  static async delete(id: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    const response = await endpoints.comments.delete(id);
    return response.data as { success: boolean; message?: string };
  }

  static async toggleLike(commentId: string): Promise<{
    success: boolean;
    liked: boolean;
    likesCount: number;
    message?: string;
  }> {
    const response = await endpoints.comments.toggleLike({ commentId });
    return response.data as {
      success: boolean;
      liked: boolean;
      likesCount: number;
      message?: string;
    };
  }

  static async getLikes(id: string): Promise<{
    success: boolean;
    data: unknown[];
    count: number;
    message?: string;
  }> {
    const response = await endpoints.comments.getLikes(id);
    return response.data as {
      success: boolean;
      data: unknown[];
      count: number;
      message?: string;
    };
  }
}
