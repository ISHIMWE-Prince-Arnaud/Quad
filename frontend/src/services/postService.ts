import { endpoints } from "@/lib/api";
import type { CreatePostData } from "@/schemas/post.schema";

/**
 * Post Service
 * Handles all post-related API calls
 */
export class PostService {
  /**
   * Create a new post
   * @param data - Post data with text and/or media
   * @returns Created post response
   */
  static async createPost(data: CreatePostData) {
    const response = await endpoints.posts.create(data);
    return response.data;
  }

  /**
   * Get all posts with pagination
   * @param params - Query parameters (limit, skip)
   * @returns Paginated posts response
   */
  static async getAllPosts(params?: { limit?: number; skip?: number }) {
    const response = await endpoints.posts.getAll(params);
    return response.data;
  }

  /**
   * Get a single post by ID
   * @param id - Post ID
   * @returns Post data
   */
  static async getPostById(id: string) {
    const response = await endpoints.posts.getById(id);
    return response.data;
  }

  /**
   * Update an existing post (author only)
   * @param id - Post ID
   * @param data - Updated post data
   * @returns Updated post response
   */
  static async updatePost(id: string, data: Partial<CreatePostData>) {
    const response = await endpoints.posts.update(id, data);
    return response.data;
  }

  /**
   * Delete a post (author only)
   * @param id - Post ID
   * @returns Delete confirmation
   */
  static async deletePost(id: string) {
    const response = await endpoints.posts.delete(id);
    return response.data;
  }
}
