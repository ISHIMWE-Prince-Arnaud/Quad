import { endpoints } from "@/lib/api";
import type {
  CreateStoryInput,
  UpdateStoryInput,
  StoryResponse,
  StoriesListResponse,
} from "@/types/story";

export class StoryService {
  static async create(data: CreateStoryInput): Promise<StoryResponse> {
    const res = await endpoints.stories.create(data);
    return res.data as StoryResponse;
  }

  static async update(
    id: string,
    data: UpdateStoryInput
  ): Promise<StoryResponse> {
    const res = await endpoints.stories.update(id, data);
    return res.data as StoryResponse;
  }

  static async delete(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await endpoints.stories.delete(id);
    return res.data as { success: boolean; message?: string };
  }

  static async getById(id: string): Promise<StoryResponse> {
    const res = await endpoints.stories.getById(id);
    return res.data as StoryResponse;
  }

  static async getAll(params?: {
    status?: "draft" | "published";
    tag?: string;
    authorId?: string;
    search?: string;
    sortBy?: "newest" | "oldest" | "popular" | "views";
    limit?: number | string;
    skip?: number | string;
  }): Promise<StoriesListResponse> {
    const res = await endpoints.stories.getAll(params);
    return res.data as StoriesListResponse;
  }

  static async getMine(params?: {
    status?: "draft" | "published";
    limit?: number | string;
    skip?: number | string;
  }): Promise<StoriesListResponse> {
    const res = await endpoints.stories.getMine(params);
    return res.data as StoriesListResponse;
  }
}
