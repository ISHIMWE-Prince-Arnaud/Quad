import { endpoints } from "@/lib/api";
import type {
  CreatePollInput,
  PollQueryParams,
  PollResponse,
  PollsListResponse,
  UpdatePollInput,
  VoteOnPollInput,
} from "@/types/poll";

export class PollService {
  static async create(data: CreatePollInput): Promise<PollResponse> {
    const res = await endpoints.polls.create(data);
    return res.data as PollResponse;
  }

  static async update(
    id: string,
    data: UpdatePollInput
  ): Promise<PollResponse> {
    const res = await endpoints.polls.update(id, data);
    return res.data as PollResponse;
  }

  static async delete(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await endpoints.polls.delete(id);
    return res.data as { success: boolean; message?: string };
  }

  static async getById(id: string): Promise<PollResponse> {
    const res = await endpoints.polls.getById(id);
    return res.data as PollResponse;
  }

  static async getAll(params?: PollQueryParams): Promise<PollsListResponse> {
    const res = await endpoints.polls.getAll(params);
    return res.data as PollsListResponse;
  }

  static async getMine(params?: {
    page?: number | string;
    limit?: number | string;
  }): Promise<PollsListResponse> {
    const res = await endpoints.polls.getMine(params);
    return res.data as PollsListResponse;
  }

  static async vote(id: string, data: VoteOnPollInput): Promise<PollResponse> {
    const res = await endpoints.polls.vote(id, data);
    return res.data as PollResponse;
  }

  static async removeVote(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const res = await endpoints.polls.removeVote(id);
    return res.data as { success: boolean; message?: string };
  }

  static async close(id: string): Promise<PollResponse> {
    const res = await endpoints.polls.close(id);
    return res.data as PollResponse;
  }
}
