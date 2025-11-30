import { endpoints } from "@/lib/api";
import type {
  Story,
  StoriesListResponse,
  StoryResponse,
  CreateStoryInput,
  UpdateStoryInput,
} from "@/types/story";

/**
 * Story Service
 * Handles all story-related API calls
 */
export class StoryService {
  /**
   * Create a new story
   * @param data - Story data with title, content, etc.
   * @returns Created story response
   */
  static async create(data: CreateStoryInput): Promise<StoryResponse> {
    const response = await endpoints.stories.create(data);
    return response.data;
  }

  /**
   * Get all published stories with pagination
   * @param params - Query parameters (limit, skip)
   * @returns Paginated stories response
   */
  static async getAll(params?: {
    limit?: number;
    skip?: number;
  }): Promise<StoriesListResponse> {
    const response = await endpoints.stories.getAll(params);
    return response.data;
  }

  /**
   * Get current user's stories (both draft and published)
   * @param params - Query parameters (limit, skip, status)
   * @returns Paginated stories response
   */
  static async getMine(params?: {
    limit?: number;
    skip?: number;
    status?: "draft" | "published";
  }): Promise<StoriesListResponse> {
    const response = await endpoints.stories.getMine(params);
    return response.data;
  }

  /**
   * Get a single story by ID
   * @param id - Story ID
   * @returns Story data
   */
  static async getById(id: string): Promise<StoryResponse> {
    const response = await endpoints.stories.getById(id);
    return response.data;
  }

  /**
   * Update an existing story (author only)
   * @param id - Story ID
   * @param data - Updated story data
   * @returns Updated story response
   */
  static async update(
    id: string,
    data: UpdateStoryInput
  ): Promise<StoryResponse> {
    const response = await endpoints.stories.update(id, data);
    return response.data;
  }

  /**
   * Delete a story (author only)
   * @param id - Story ID
   * @returns Delete confirmation
   */
  static async delete(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await endpoints.stories.delete(id);
    return response.data;
  }
}
