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
}
