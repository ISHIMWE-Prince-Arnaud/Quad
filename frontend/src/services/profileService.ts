import { endpoints } from "@/lib/api";
import type {
  ApiProfile,
  ProfileUpdateData,
  ContentItem,
  PaginationParams,
  ApiPost,
  ApiStory,
  ApiPoll,
} from "@/types/api";

export class ProfileService {
  // Get user profile by username
  static async getProfileByUsername(username: string): Promise<ApiProfile> {
    const response = await endpoints.profiles.getByUsername(username);
    return response.data.data;
  }

  // Get user profile by ID
  static async getProfileById(userId: string): Promise<ApiProfile> {
    const response = await endpoints.profiles.getById(userId);
    return response.data.data;
  }

  // Update own profile
  static async updateProfile(
    username: string,
    data: ProfileUpdateData,
  ): Promise<ApiProfile> {
    const response = await endpoints.profiles.updateOwn(username, data);
    return response.data.data;
  }

  // Get user's posts
  static async getUserPosts(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ posts: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPosts(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPosts: ApiPost[] = Array.isArray(rawData)
      ? (rawData as ApiPost[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform posts to ContentItem format
    const posts: ContentItem[] = rawPosts.map((post: ApiPost) => ({
      _id: post._id,
      type: "post" as const,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // Prefer backend text, fall back to legacy content
      text: post.text ?? post.content ?? "",
      content: post.text ?? post.content ?? "",
      media: post.media,
      reactionsCount: post.reactionsCount,
      commentsCount: post.commentsCount,
    }));

    return {
      posts,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPosts.length,
    };
  }

  // Get user's stories
  static async getUserStories(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ stories: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserStories(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawStories: ApiStory[] = Array.isArray(rawData)
      ? (rawData as ApiStory[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform stories to ContentItem format
    const stories: ContentItem[] = rawStories.map((story: ApiStory) => ({
      _id: story._id,
      type: "story" as const,
      content: story.content || "",
      author: story.author,
      createdAt: story.createdAt,
      views: story.views,
      images: story.media ? [story.media] : undefined,
    }));

    return {
      stories,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawStories.length,
    };
  }

  // Get user's polls
  static async getUserPolls(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ polls: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPolls(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPolls: ApiPoll[] = Array.isArray(rawData)
      ? (rawData as ApiPoll[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform polls to ContentItem format
    const polls: ContentItem[] = rawPolls.map((poll: ApiPoll) => ({
      _id: poll._id,
      type: "poll" as const,
      content: poll.question,
      question: poll.question,
      author: poll.author,
      createdAt: poll.createdAt,
      totalVotes: poll.totalVotes,
    }));

    return {
      polls,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPolls.length,
    };
  }

  // Get user content by type
  static async getUserContent(
    username: string,
    type: "posts" | "stories" | "polls",
    params: PaginationParams = {},
  ): Promise<{ items: ContentItem[]; hasMore: boolean; total: number }> {
    switch (type) {
      case "posts": {
        const result = await this.getUserPosts(username, params);
        return {
          items: result.posts,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      case "stories": {
        const result = await this.getUserStories(username, params);
        return {
          items: result.stories,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      case "polls": {
        const result = await this.getUserPolls(username, params);
        return {
          items: result.polls,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }
}
