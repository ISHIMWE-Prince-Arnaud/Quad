import { endpoints } from "@/lib/api";

export type ReactionType = "love";
export type ReactableContentType = "post" | "story" | "poll" | "comment";

export interface ToggleReactionResponse {
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    contentType: ReactableContentType;
    contentId: string;
    userId: string;
    username: string;
    profileImage?: string;
    type: ReactionType;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  reactionCount?: number;
}

export interface GetByContentResponse {
  success: boolean;
  message?: string;
  data?: {
    reactions: Array<{
      _id: string;
      contentType: ReactableContentType;
      contentId: string;
      userId: string;
      username: string;
      profileImage?: string;
      type: ReactionType;
      createdAt: string;
      updatedAt: string;
    }>;
    reactionCounts: Array<{ type: ReactionType; count: number }>;
    userReaction?: {
      _id: string;
      type: ReactionType;
      contentType: ReactableContentType;
      contentId: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    totalCount: number;
  };
}

export class ReactionService {
  static async toggle(
    contentType: ReactableContentType,
    contentId: string,
    type: ReactionType
  ): Promise<ToggleReactionResponse> {
    const response = await endpoints.reactions.toggle({
      contentType,
      contentId,
      type,
    });
    return response.data as ToggleReactionResponse;
  }

  static async getUserReactions(params?: {
    limit?: number;
    skip?: number;
  }): Promise<{
    success: boolean;
    data: Array<{
      _id: string;
      contentType: ReactableContentType;
      contentId: string;
      userId: string;
      username: string;
      profileImage?: string;
      type: ReactionType;
      createdAt: string;
      updatedAt?: string;
    }>;
    pagination?: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
    message?: string;
  }> {
    const response = await endpoints.reactions.getUserReactions(params);
    return response.data as {
      success: boolean;
      data: Array<{
        _id: string;
        contentType: ReactableContentType;
        contentId: string;
        userId: string;
        username: string;
        profileImage?: string;
        type: ReactionType;
        createdAt: string;
        updatedAt?: string;
      }>;
      pagination?: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
      };
      message?: string;
    };
  }

  static async getByContent(
    contentType: ReactableContentType,
    contentId: string
  ): Promise<GetByContentResponse> {
    const response = await endpoints.reactions.getByContent(
      contentType,
      contentId
    );
    return response.data as GetByContentResponse;
  }

  static async remove(
    contentType: ReactableContentType,
    contentId: string
  ): Promise<{ success: boolean; message?: string; reactionCount?: number }> {
    const response = await endpoints.reactions.remove(contentType, contentId);
    return response.data as {
      success: boolean;
      message?: string;
      reactionCount?: number;
    };
  }
}
