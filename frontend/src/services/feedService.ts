import { endpoints } from "@/lib/api";
import type { FeedApiResponse, FeedQueryParams, FeedType } from "@/types/feed";

export class FeedService {
  static async getFeed(
    feedType: FeedType,
    params: FeedQueryParams,
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
}
