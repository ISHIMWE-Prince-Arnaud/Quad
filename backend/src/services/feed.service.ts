import type {
  FeedQuerySchemaType,
  NewCountQuerySchemaType,
} from "../schemas/feed.schema.js";
import type {
  ContentTab,
  FeedSort,
  IFeedResponse,
  IRawContentItem,
} from "../types/feed.types.js";
import {
  applyAuthorDiversity,
  applyContentTypeDiversity,
  getUserFollowing,
  scoreAndRankContent,
} from "../utils/feed.util.js";
import { FEED_CONFIG } from "../config/feed.config.js";
import { PostSource } from "./feed/PostSource.js";
import { PollSource } from "./feed/PollSource.js";
import { StorySource } from "./feed/StorySource.js";
import type { FeedSource } from "./feed/FeedSource.interface.js";

// Initialize sources
const postSource = new PostSource();
const pollSource = new PollSource();
const storySource = new StorySource();

const sources: Record<string, FeedSource> = {
  posts: postSource,
  polls: pollSource,
  stories: storySource,
};

export class FeedService {
  /**
   * Get Feed for Following Tab (Only content from followed users)
   */
  static async getFollowingFeed(
    userId: string,
    query: FeedQuerySchemaType,
  ): Promise<IFeedResponse> {
    const { tab, cursor, limit, sort } = query;

    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    if (followingIds.length === 0) {
      return this.emptyResponse(tab, sort);
    }

    let items: IRawContentItem[] = [];
    const baseQuery: Record<string, unknown> = {};

    if (cursor) {
      baseQuery._id = { $lt: cursor };
    }

    if (tab === "home") {
      // Mixed content from following
      const postsLimit = Math.ceil(limit * FEED_CONFIG.CONTENT_MIX.POSTS_RATIO);
      const pollsLimit = Math.ceil(limit * FEED_CONFIG.CONTENT_MIX.POLLS_RATIO);
      const storiesLimit = Math.ceil(
        limit * FEED_CONFIG.CONTENT_MIX.STORIES_RATIO,
      );

      const [posts, polls, stories] = await Promise.all([
        postSource.fetch(
          { ...baseQuery, userId: { $in: followingIds } },
          postsLimit,
        ),
        pollSource.fetch(
          {
            ...baseQuery,
            "author.clerkId": { $in: followingIds },
          },
          pollsLimit,
        ),
        storySource.fetch(
          {
            ...baseQuery,
            userId: { $in: followingIds },
            status: "published",
          },
          storiesLimit,
        ),
      ]);

      items = [...posts, ...polls, ...stories];
    } else {
      // Specific content type
      const source = sources[tab];
      if (source) {
        // Construct query based on type
        const typeQuery = { ...baseQuery };
        if (tab === "posts") {
          typeQuery.userId = { $in: followingIds };
        } else if (tab === "polls") {
          typeQuery["author.clerkId"] = { $in: followingIds };
        } else if (tab === "stories") {
          typeQuery.userId = { $in: followingIds };
          typeQuery.status = "published";
        }

        items = await source.fetch(typeQuery, limit);
      }
    }

    return this.processAndReturnFeed(items, userId, query);
  }

  /**
   * Get Feed for For You Tab (Discovery + Following mix)
   */
  static async getForYouFeed(
    userId: string,
    query: FeedQuerySchemaType,
  ): Promise<IFeedResponse> {
    const { tab, cursor, limit } = query;

    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    let items: IRawContentItem[] = [];
    const baseQuery: Record<string, unknown> = {};
    if (cursor) {
      baseQuery._id = { $lt: cursor };
    }

    // Helper to fetch mixed (following + discover) for a specific source
    const fetchMixedForSource = async (
      source: FeedSource,
      typeLimit: number,
      authorField: string,
      extraQuery: Record<string, unknown> = {},
    ) => {
      // If user follows no one, everything is discovery
      if (followingIds.length === 0) {
        return source.fetch({ ...baseQuery, ...extraQuery }, typeLimit);
      }

      const fLimit = Math.ceil(typeLimit * FEED_CONFIG.FOR_YOU.FOLLOWING_RATIO);
      const dLimit = Math.ceil(typeLimit * FEED_CONFIG.FOR_YOU.DISCOVERY_RATIO);

      const [followingItems, discoverItems] = await Promise.all([
        source.fetch(
          {
            ...baseQuery,
            ...extraQuery,
            [authorField]: { $in: followingIds },
          },
          fLimit,
        ),
        source.fetch(
          {
            ...baseQuery,
            ...extraQuery,
            [authorField]: { $nin: followingIds },
          },
          dLimit,
        ),
      ]);
      return [...followingItems, ...discoverItems];
    };

    if (tab === "home") {
      const postsLimit = Math.ceil(limit * FEED_CONFIG.CONTENT_MIX.POSTS_RATIO);
      const pollsLimit = Math.ceil(limit * FEED_CONFIG.CONTENT_MIX.POLLS_RATIO);
      const storiesLimit = Math.ceil(
        limit * FEED_CONFIG.CONTENT_MIX.STORIES_RATIO,
      );

      const [posts, polls, stories] = await Promise.all([
        fetchMixedForSource(postSource, postsLimit, "userId"),
        fetchMixedForSource(pollSource, pollsLimit, "author.clerkId", {}),
        fetchMixedForSource(storySource, storiesLimit, "userId", {
          status: "published",
        }),
      ]);

      items = [...posts, ...polls, ...stories];
    } else {
      // Specific tab
      if (tab === "posts") {
        items = await fetchMixedForSource(postSource, limit, "userId");
      } else if (tab === "polls") {
        items = await fetchMixedForSource(
          pollSource,
          limit,
          "author.clerkId",
          {},
        );
      } else if (tab === "stories") {
        items = await fetchMixedForSource(storySource, limit, "userId", {
          status: "published",
        });
      }
    }

    return this.processAndReturnFeed(items, userId, query, "foryou");
  }

  /**
   * Get Count of New Content
   */
  static async getNewContentCount(
    userId: string,
    query: NewCountQuerySchemaType,
  ) {
    const { feedType, tab, since } = query;
    const baseQuery: Record<string, unknown> = { _id: { $gt: since } };

    let followingIds: string[] = [];
    if (feedType === "following") {
      const followingSet = await getUserFollowing(userId);
      followingIds = Array.from(followingSet);
      if (followingIds.length === 0) return { count: 0 };
    }

    // Helper to get count for a specific source
    const getCountForSource = async (
      source: FeedSource,
      authorField: string,
      extraQuery: Record<string, unknown> = {},
    ) => {
      const q = { ...baseQuery, ...extraQuery };
      if (feedType === "following") {
        q[authorField] = { $in: followingIds };
      }
      return source.count(q);
    };

    let count = 0;

    if (tab === "home") {
      const [postCount, pollCount, storyCount] = await Promise.all([
        getCountForSource(postSource, "userId"),
        getCountForSource(pollSource, "author.clerkId", {}),
        getCountForSource(storySource, "userId", { status: "published" }),
      ]);
      count = postCount + pollCount + storyCount;
    } else {
      if (tab === "posts") {
        count = await getCountForSource(postSource, "userId");
      } else if (tab === "polls") {
        count = await getCountForSource(pollSource, "author.clerkId", {});
      } else if (tab === "stories") {
        count = await getCountForSource(storySource, "userId", {
          status: "published",
        });
      }
    }

    return { count };
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  private static emptyResponse(
    tab: ContentTab,
    sort: FeedSort,
    feedType: "following" | "foryou" = "following",
  ): IFeedResponse {
    return {
      items: [],
      pagination: {
        nextCursor: undefined,
        hasMore: false,
        count: 0,
      },
      metadata: {
        feedType,
        tab,
        sort,
      },
    };
  }

  private static async processAndReturnFeed(
    items: IRawContentItem[],
    userId: string,
    query: FeedQuerySchemaType,
    feedType: "following" | "foryou" = "following",
  ): Promise<IFeedResponse> {
    const { tab, limit, sort } = query;

    let scoredItems = await scoreAndRankContent(items, userId, sort);

    if (tab === "home") {
      scoredItems = applyContentTypeDiversity(scoredItems);
      scoredItems = applyAuthorDiversity(scoredItems);
    }

    const resultItems = scoredItems.slice(0, limit);
    const nextCursor =
      resultItems.length > 0
        ? (resultItems[resultItems.length - 1]?._id as string)
        : undefined;
    const hasMore = scoredItems.length > limit;

    return {
      items: resultItems,
      pagination: {
        nextCursor,
        hasMore,
        count: resultItems.length,
      },
      metadata: {
        feedType,
        tab,
        sort,
      },
    };
  }
}
