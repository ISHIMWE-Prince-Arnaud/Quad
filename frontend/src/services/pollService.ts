import { endpoints } from "@/lib/api";
import type {
  PollsListResponse,
  PollResponse,
  CreatePollInput,
  UpdatePollInput,
  VoteOnPollInput,
  PollQueryParams,
} from "@/types/poll";

/**
 * Poll Service
 * Handles all poll-related API calls including voting
 */
export class PollService {
  /**
   * Create a new poll
   * @param data - Poll data with question, options, settings
   * @returns Created poll response
   */
  static async create(data: CreatePollInput): Promise<PollResponse> {
    const response = await endpoints.polls.create(data);
    return response.data;
  }

  /**
   * Get all polls with pagination and filters
   * @param params - Query parameters (page, limit, status, etc.)
   * @returns Paginated polls response
   */
  static async getAll(params?: PollQueryParams): Promise<PollsListResponse> {
    const response = await endpoints.polls.getAll(params);
    return response.data;
  }

  /**
   * Get current user's polls
   * @param params - Query parameters (page, limit)
   * @returns Paginated polls response
   */
  static async getMine(params?: {
    page?: number;
    limit?: number;
  }): Promise<PollsListResponse> {
    const response = await endpoints.polls.getMine(params);
    return response.data;
  }

  /**
   * Get a single poll by ID
   * @param id - Poll ID
   * @returns Poll data
   */
  static async getById(id: string): Promise<PollResponse> {
    const response = await endpoints.polls.getById(id);
    return response.data;
  }

  /**
   * Update an existing poll (author only)
   * @param id - Poll ID
   * @param data - Updated poll data
   * @returns Updated poll response
   */
  static async update(
    id: string,
    data: UpdatePollInput,
  ): Promise<PollResponse> {
    const response = await endpoints.polls.update(id, data);
    return response.data;
  }

  /**
   * Delete a poll (author only)
   * @param id - Poll ID
   * @returns Delete confirmation
   */
  static async delete(
    id: string,
  ): Promise<{ success: boolean; message?: string }> {
    const response = await endpoints.polls.delete(id);
    return response.data;
  }

  /**
   * Vote on a poll
   * @param id - Poll ID
   * @param data - Vote data with option indices
   * @returns Updated poll with vote
   */
  static async vote(id: string, data: VoteOnPollInput): Promise<PollResponse> {
    const response = await endpoints.polls.vote(id, data);
    return response.data;
  }
}
