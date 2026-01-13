import type { FeedQuerySchemaType, NewCountQuerySchemaType } from "../schemas/feed.schema.js";
import type { IFeedResponse, IRawContentItem } from "../types/feed.types.js";
import {
  applyAuthorDiversity,
  applyContentTypeDiversity,
  fetchPolls,
  fetchPosts,
  fetchStories,
  getUserFollowing,
  scoreAndRankContent,
} from "../utils/feed.util.js";
import { Poll } from "../models/Poll.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";

const getContentAuthorId = (content: unknown): string => {
  if (!content || typeof content !== "object") return "";
  const obj = content as Record<string, unknown>;
  const author = obj.author;
  if (author && typeof author === "object") {
    const clerkId = (author as Record<string, unknown>).clerkId;
    if (typeof clerkId === "string") return clerkId;
  }
  const userId = obj.userId;
  return typeof userId === "string" ? userId : "";
};

export class FeedService {
  static async getFollowingFeed(userId: string, query: FeedQuerySchemaType): Promise<IFeedResponse> {
    const { tab, cursor, limit, sort } = query;

    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    if (followingIds.length === 0) {
      return {
        items: [],
        pagination: {
          nextCursor: undefined,
          hasMore: false,
          count: 0,
        },
        metadata: {
          feedType: "following",
          tab,
          sort,
        },
      };
    }

    let items: IRawContentItem[] = [];

    const baseQuery: Record<string, unknown> = {};
    if (cursor) {
      baseQuery._id = { $lt: cursor };
    }

    switch (tab) {
      case "posts": {
        const posts = await Post.find({
          ...baseQuery,
          userId: { $in: followingIds },
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        items = posts.map((post) => ({
          _id: post._id,
          type: "post" as const,
          content: post,
          createdAt: post.createdAt || new Date(),
          authorId: getContentAuthorId(post),
          reactionsCount: post.reactionsCount || 0,
          commentsCount: post.commentsCount || 0,
        }));
        break;
      }

      case "polls": {
        const polls = await Poll.find({
          ...baseQuery,
          "author.clerkId": { $in: followingIds },
          status: { $ne: "closed" },
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        items = polls.map((poll) => ({
          _id: poll._id,
          type: "poll" as const,
          content: poll,
          createdAt: poll.createdAt,
          authorId: getContentAuthorId(poll),
          reactionsCount: poll.reactionsCount || 0,
          commentsCount: poll.commentsCount || 0,
          totalVotes: poll.totalVotes || 0,
        }));
        break;
      }

      case "stories": {
        const stories = await Story.find({
          ...baseQuery,
          userId: { $in: followingIds },
          status: "published",
        })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        items = stories.map((story) => ({
          _id: story._id,
          type: "story" as const,
          content: story,
          createdAt: story.createdAt || new Date(),
          authorId: getContentAuthorId(story),
          reactionsCount: story.reactionsCount || 0,
          commentsCount: story.commentsCount || 0,
        }));
        break;
      }

      case "home":
      default: {
        const [posts, polls, stories] = await Promise.all([
          Post.find({
            ...baseQuery,
            userId: { $in: followingIds },
          })
            .sort({ createdAt: -1 })
            .limit(Math.ceil(limit * 0.5))
            .lean(),

          Poll.find({
            ...baseQuery,
            "author.clerkId": { $in: followingIds },
            status: { $ne: "closed" },
          })
            .sort({ createdAt: -1 })
            .limit(Math.ceil(limit * 0.3))
            .lean(),

          Story.find({
            ...baseQuery,
            userId: { $in: followingIds },
            status: "published",
          })
            .sort({ createdAt: -1 })
            .limit(Math.ceil(limit * 0.2))
            .lean(),
        ]);

        items = [
          ...posts.map((post) => ({
            _id: post._id,
            type: "post" as const,
            content: post,
            createdAt: post.createdAt || new Date(),
            authorId: getContentAuthorId(post),
            reactionsCount: post.reactionsCount || 0,
            commentsCount: post.commentsCount || 0,
          })),
          ...polls.map((poll) => ({
            _id: poll._id,
            type: "poll" as const,
            content: poll,
            createdAt: poll.createdAt,
            authorId: getContentAuthorId(poll),
            reactionsCount: poll.reactionsCount || 0,
            commentsCount: poll.commentsCount || 0,
            totalVotes: poll.totalVotes || 0,
          })),
          ...stories.map((story) => ({
            _id: story._id,
            type: "story" as const,
            content: story,
            createdAt: story.createdAt || new Date(),
            authorId: getContentAuthorId(story),
            reactionsCount: story.reactionsCount || 0,
            commentsCount: story.commentsCount || 0,
          })),
        ];
        break;
      }
    }

    let scoredItems = await scoreAndRankContent(items, userId, sort);

    if (tab === "home") {
      scoredItems = applyContentTypeDiversity(scoredItems);
      scoredItems = applyAuthorDiversity(scoredItems);
    }

    const resultItems = scoredItems.slice(0, limit);

    const nextCursor =
      resultItems.length > 0 ? resultItems[resultItems.length - 1]?._id : undefined;
    const hasMore = scoredItems.length > limit;

    return {
      items: resultItems,
      pagination: {
        nextCursor,
        hasMore,
        count: resultItems.length,
      },
      metadata: {
        feedType: "following",
        tab,
        sort,
      },
    };
  }

  static async getForYouFeed(userId: string, query: FeedQuerySchemaType): Promise<IFeedResponse> {
    const { tab, cursor, limit, sort } = query;

    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    let items: IRawContentItem[] = [];

    const followingLimit = Math.ceil(limit * 0.7);
    const discoverLimit = Math.ceil(limit * 0.3);

    switch (tab) {
      case "posts": {
        const [followingPosts, discoverPosts] = await Promise.all([
          Post.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0 ? { userId: { $in: followingIds } } : {}),
          })
            .sort({ createdAt: -1 })
            .limit(followingLimit)
            .lean(),

          Post.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0 ? { userId: { $nin: followingIds } } : {}),
          })
            .sort({ createdAt: -1 })
            .limit(discoverLimit)
            .lean(),
        ]);

        items = [...followingPosts, ...discoverPosts].map((post) => ({
          _id: post._id,
          type: "post" as const,
          content: post,
          createdAt: post.createdAt || new Date(),
          authorId: getContentAuthorId(post),
          reactionsCount: post.reactionsCount || 0,
          commentsCount: post.commentsCount || 0,
        }));
        break;
      }

      case "polls": {
        const [followingPolls, discoverPolls] = await Promise.all([
          Poll.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0
              ? { "author.clerkId": { $in: followingIds } }
              : {}),
            status: { $ne: "closed" },
          })
            .sort({ createdAt: -1 })
            .limit(followingLimit)
            .lean(),

          Poll.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0
              ? { "author.clerkId": { $nin: followingIds } }
              : {}),
            status: { $ne: "closed" },
          })
            .sort({ createdAt: -1 })
            .limit(discoverLimit)
            .lean(),
        ]);

        items = [...followingPolls, ...discoverPolls].map((poll) => ({
          _id: poll._id,
          type: "poll" as const,
          content: poll,
          createdAt: poll.createdAt,
          authorId: getContentAuthorId(poll),
          reactionsCount: poll.reactionsCount || 0,
          commentsCount: poll.commentsCount || 0,
          totalVotes: poll.totalVotes || 0,
        }));
        break;
      }

      case "stories": {
        const [followingStories, discoverStories] = await Promise.all([
          Story.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0 ? { userId: { $in: followingIds } } : {}),
            status: "published",
          })
            .sort({ createdAt: -1 })
            .limit(followingLimit)
            .lean(),

          Story.find({
            ...(cursor ? { _id: { $lt: cursor } } : {}),
            ...(followingIds.length > 0 ? { userId: { $nin: followingIds } } : {}),
            status: "published",
          })
            .sort({ createdAt: -1 })
            .limit(discoverLimit)
            .lean(),
        ]);

        items = [...followingStories, ...discoverStories].map((story) => ({
          _id: story._id,
          type: "story" as const,
          content: story,
          createdAt: story.createdAt || new Date(),
          authorId: getContentAuthorId(story),
          reactionsCount: story.reactionsCount || 0,
          commentsCount: story.commentsCount || 0,
        }));
        break;
      }

      case "home":
      default: {
        const postsLimit = Math.ceil(limit * 0.5);
        const pollsLimit = Math.ceil(limit * 0.3);
        const storiesLimit = Math.ceil(limit * 0.2);

        const [posts, polls, stories] = await Promise.all([
          fetchPosts(cursor, postsLimit),
          fetchPolls(cursor, pollsLimit),
          fetchStories(cursor, storiesLimit),
        ]);

        items = [...posts, ...polls, ...stories];
        break;
      }
    }

    let scoredItems = await scoreAndRankContent(items, userId, sort);

    if (tab === "home") {
      scoredItems = applyContentTypeDiversity(scoredItems);
      scoredItems = applyAuthorDiversity(scoredItems);
    }

    const resultItems = scoredItems.slice(0, limit);

    const nextCursor =
      resultItems.length > 0 ? resultItems[resultItems.length - 1]?._id : undefined;
    const hasMore = scoredItems.length > limit;

    return {
      items: resultItems,
      pagination: {
        nextCursor,
        hasMore,
        count: resultItems.length,
      },
      metadata: {
        feedType: "foryou",
        tab,
        sort,
      },
    };
  }

  static async getNewContentCount(userId: string, query: NewCountQuerySchemaType) {
    const { feedType, tab, since } = query;

    const baseQuery: Record<string, unknown> = {
      _id: { $gt: since },
    };

    let followingIds: string[] = [];
    if (feedType === "following") {
      const followingSet = await getUserFollowing(userId);
      followingIds = Array.from(followingSet);

      if (followingIds.length === 0) {
        return { count: 0 };
      }
    }

    let count = 0;

    switch (tab) {
      case "posts":
        if (feedType === "following") {
          count = await Post.countDocuments({
            ...baseQuery,
            userId: { $in: followingIds },
          });
        } else {
          count = await Post.countDocuments(baseQuery);
        }
        break;

      case "polls":
        if (feedType === "following") {
          count = await Poll.countDocuments({
            ...baseQuery,
            "author.clerkId": { $in: followingIds },
            status: { $ne: "closed" },
          });
        } else {
          count = await Poll.countDocuments({
            ...baseQuery,
            status: { $ne: "closed" },
          });
        }
        break;

      case "stories": {
        if (feedType === "following") {
          count = await Story.countDocuments({
            ...baseQuery,
            userId: { $in: followingIds },
            status: "published",
          });
        } else {
          count = await Story.countDocuments({
            ...baseQuery,
            status: "published",
          });
        }
        break;
      }

      case "home":
      default: {
        let postCount, pollCount, storyCount;

        if (feedType === "following") {
          [postCount, pollCount, storyCount] = await Promise.all([
            Post.countDocuments({
              ...baseQuery,
              userId: { $in: followingIds },
            }),
            Poll.countDocuments({
              ...baseQuery,
              "author.clerkId": { $in: followingIds },
              status: { $ne: "closed" },
            }),
            Story.countDocuments({
              ...baseQuery,
              userId: { $in: followingIds },
              status: "published",
            }),
          ]);
        } else {
          [postCount, pollCount, storyCount] = await Promise.all([
            Post.countDocuments(baseQuery),
            Poll.countDocuments({
              ...baseQuery,
              status: { $ne: "closed" },
            }),
            Story.countDocuments({
              ...baseQuery,
              status: "published",
            }),
          ]);
        }

        count = postCount + pollCount + storyCount;
        break;
      }
    }

    return { count };
  }
}
