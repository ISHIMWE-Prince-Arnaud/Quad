import { endpoints } from '@/lib/api';
import type { 
  ApiProfile, 
  ProfileUpdateData, 
  ContentItem, 
  PaginationParams,
  ApiPost,
  ApiStory,
  ApiPoll
} from '@/types/api';

export class ProfileService {
  // Get own profile
  static async getOwnProfile(): Promise<ApiProfile> {
    const response = await endpoints.profiles.getOwn();
    return response.data.data;
  }

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
  static async updateProfile(data: ProfileUpdateData): Promise<ApiProfile> {
    const response = await endpoints.profiles.updateOwn(data);
    return response.data.data;
  }

  // Get user's posts
  static async getUserPosts(
    username: string, 
    params: PaginationParams = {}
  ): Promise<{ posts: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPosts(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params
    });
    
    // Transform posts to ContentItem format
    const posts: ContentItem[] = response.data.data.posts.map((post: ApiPost) => ({
      _id: post._id,
      type: 'post' as const,
      content: post.content,
      images: post.images,
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes,
      comments: post.comments,
      isLiked: post.isLiked
    }));

    return {
      posts,
      hasMore: response.data.data.hasMore || false,
      total: response.data.data.total || 0
    };
  }

  // Get user's stories
  static async getUserStories(
    username: string, 
    params: PaginationParams = {}
  ): Promise<{ stories: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserStories(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params
    });
    
    // Transform stories to ContentItem format
    const stories: ContentItem[] = response.data.data.stories.map((story: ApiStory) => ({
      _id: story._id,
      type: 'story' as const,
      content: story.content || '',
      media: story.media,
      author: story.author,
      createdAt: story.createdAt,
      views: story.views
    }));

    return {
      stories,
      hasMore: response.data.data.hasMore || false,
      total: response.data.data.total || 0
    };
  }

  // Get user's polls
  static async getUserPolls(
    username: string, 
    params: PaginationParams = {}
  ): Promise<{ polls: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPolls(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params
    });
    
    // Transform polls to ContentItem format
    const polls: ContentItem[] = response.data.data.polls.map((poll: ApiPoll) => ({
      _id: poll._id,
      type: 'poll' as const,
      content: poll.question,
      author: poll.author,
      createdAt: poll.createdAt,
      totalVotes: poll.totalVotes
    }));

    return {
      polls,
      hasMore: response.data.data.hasMore || false,
      total: response.data.data.total || 0
    };
  }

  // Get user content by type
  static async getUserContent(
    username: string,
    type: 'posts' | 'stories' | 'polls',
    params: PaginationParams = {}
  ): Promise<{ items: ContentItem[]; hasMore: boolean; total: number }> {
    switch (type) {
      case 'posts': {
        const result = await this.getUserPosts(username, params);
        return { items: result.posts, hasMore: result.hasMore, total: result.total };
      }
      case 'stories': {
        const result = await this.getUserStories(username, params);
        return { items: result.stories, hasMore: result.hasMore, total: result.total };
      }
      case 'polls': {
        const result = await this.getUserPolls(username, params);
        return { items: result.polls, hasMore: result.hasMore, total: result.total };
      }
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }
}
