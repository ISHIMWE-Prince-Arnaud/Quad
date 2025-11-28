import { endpoints } from "@/lib/api";
import type {
  FeedApiResponse,
  FeedQueryParams,
  FeedType,
  NewCountParams,
} from "@/types/feed";

export class FeedService {
  static async getFeed(
    feedType: FeedType,
    params: FeedQueryParams
  ): Promise<FeedApiResponse> {
    const apiCall =
      feedType === "following"
        ? endpoints.feed.getFollowing
        : endpoints.feed.getForYou;

    const response = await apiCall({
      tab: params.tab,
      cursor: params.cursor,
      limit: params.limit,
      sort: params.sort,
    });

    return response.data as FeedApiResponse;
  }

  static async getNewContentCount(
    params: NewCountParams
  ): Promise<{ success: boolean; data: { count: number }; message?: string }> {
    const response = await endpoints.feed.getNewCount({
      feedType: params.feedType,
      tab: params.tab,
      since: params.since,
    });

    return response.data as {
      success: boolean;
      data: { count: number };
      message?: string;
    };
  }
}
