/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import type {
  FeedQuerySchemaType,
  NewCountQuerySchemaType,
} from "../schemas/feed.schema.js";
import type { IFeedResponse, IRawContentItem } from "../types/feed.types.js";
import {
  fetchContentByTab,
  getUserFollowing,
  scoreAndRankContent,
  applyAuthorDiversity,
  applyContentTypeDiversity,
  fetchPosts,
  fetchPolls,
  fetchStories,
} from "../utils/feed.util.js";
import { Post } from "../models/Post.model.js";
import { Poll } from "../models/Poll.model.js";
import { Story } from "../models/Story.model.js";

// =========================
// GET FOLLOWING FEED
// =========================
export const getFollowingFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const query = req.query as unknown as FeedQuerySchemaType;
    const { tab, cursor, limit, sort } = query;

    // Get user's following list
    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    if (followingIds.length === 0) {
      // User doesn't follow anyone, return empty feed
      return res.json({
        success: true,
        data: {
          items: [],
          pagination: {
            hasMore: false,
            count: 0,
          },
          metadata: {
            feedType: "following",
            tab,
            sort,
          },
        },
      });
    }

    // Fetch content from followed users based on tab
    let items: IRawContentItem[] = [];

    const baseQuery: any = {};
    if (cursor) {
      baseQuery._id = { $lt: cursor };
    }

    switch (tab) {
      case "posts":
        {
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
            authorId: post.userId,
            reactionsCount: post.reactionsCount || 0,
            commentsCount: post.commentsCount || 0,
          }));
        }
        break;

      case "polls":
        {
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
            authorId: poll.author.clerkId,
            reactionsCount: poll.reactionsCount || 0,
            commentsCount: poll.commentsCount || 0,
            totalVotes: poll.totalVotes || 0,
          }));
        }
        break;

      case "stories":
        {
          const now = new Date();
          const stories = await Story.find({
            ...baseQuery,
            userId: { $in: followingIds },
            status: "published",
            expiresAt: { $gt: now },
          })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

          items = stories.map((story) => ({
            _id: story._id,
            type: "story" as const,
            content: story,
            createdAt: story.createdAt || new Date(),
            authorId: story.userId,
            reactionsCount: story.reactionsCount || 0,
            commentsCount: story.commentsCount || 0,
          }));
        }
        break;

      case "home":
      default:
        {
          // Fetch all content types from followed users
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
              expiresAt: { $gt: new Date() },
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
              authorId: post.userId,
              reactionsCount: post.reactionsCount || 0,
              commentsCount: post.commentsCount || 0,
            })),
            ...polls.map((poll) => ({
              _id: poll._id,
              type: "poll" as const,
              content: poll,
              createdAt: poll.createdAt,
              authorId: poll.author.clerkId,
              reactionsCount: poll.reactionsCount || 0,
              commentsCount: poll.commentsCount || 0,
              totalVotes: poll.totalVotes || 0,
            })),
            ...stories.map((story) => ({
              _id: story._id,
              type: "story" as const,
              content: story,
              createdAt: story.createdAt || new Date(),
              authorId: story.userId,
              reactionsCount: story.reactionsCount || 0,
              commentsCount: story.commentsCount || 0,
            })),
          ];
        }
        break;
    }

    // Score and rank items
    let scoredItems = await scoreAndRankContent(items, userId, sort);

    // Apply diversity filters for home tab
    if (tab === "home") {
      scoredItems = applyContentTypeDiversity(scoredItems);
      scoredItems = applyAuthorDiversity(scoredItems);
    }

    // Limit to requested count
    const resultItems = scoredItems.slice(0, limit);

    // Determine next cursor and hasMore
    const nextCursor =
      resultItems.length > 0
        ? resultItems[resultItems.length - 1]?._id
        : undefined;
    const hasMore = scoredItems.length > limit;

    const response: IFeedResponse = {
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

    return res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("Error fetching following feed:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET FOR YOU FEED
// =========================
export const getForYouFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const query = req.query as unknown as FeedQuerySchemaType;
    const { tab, cursor, limit, sort } = query;

    // Get user's following list for priority boost
    const followingSet = await getUserFollowing(userId);
    const followingIds = Array.from(followingSet);

    // Fetch content (70% from following, 30% from others)
    let items: IRawContentItem[] = [];

    const followingLimit = Math.ceil(limit * 0.7);
    const discoverLimit = Math.ceil(limit * 0.3);

    // Fetch based on tab
    switch (tab) {
      case "posts":
        {
          const [followingPosts, discoverPosts] = await Promise.all([
            Post.find({
              ...(cursor ? { _id: { $lt: cursor } } : {}),
              ...(followingIds.length > 0
                ? { userId: { $in: followingIds } }
                : {}),
            })
              .sort({ createdAt: -1 })
              .limit(followingLimit)
              .lean(),

            Post.find({
              ...(cursor ? { _id: { $lt: cursor } } : {}),
              ...(followingIds.length > 0
                ? { userId: { $nin: followingIds } }
                : {}),
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
            authorId: post.userId,
            reactionsCount: post.reactionsCount || 0,
            commentsCount: post.commentsCount || 0,
          }));
        }
        break;

      case "polls":
        {
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
            authorId: poll.author.clerkId,
            reactionsCount: poll.reactionsCount || 0,
            commentsCount: poll.commentsCount || 0,
            totalVotes: poll.totalVotes || 0,
          }));
        }
        break;

      case "stories":
        {
          const now = new Date();
          const [followingStories, discoverStories] = await Promise.all([
            Story.find({
              ...(cursor ? { _id: { $lt: cursor } } : {}),
              ...(followingIds.length > 0
                ? { userId: { $in: followingIds } }
                : {}),
              status: "published",
              expiresAt: { $gt: now },
            })
              .sort({ createdAt: -1 })
              .limit(followingLimit)
              .lean(),

            Story.find({
              ...(cursor ? { _id: { $lt: cursor } } : {}),
              ...(followingIds.length > 0
                ? { userId: { $nin: followingIds } }
                : {}),
              status: "published",
              expiresAt: { $gt: now },
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
            authorId: story.userId,
            reactionsCount: story.reactionsCount || 0,
            commentsCount: story.commentsCount || 0,
          }));
        }
        break;

      case "home":
      default:
        {
          // Fetch all content types (mixed)
          const postsLimit = Math.ceil(limit * 0.5);
          const pollsLimit = Math.ceil(limit * 0.3);
          const storiesLimit = Math.ceil(limit * 0.2);

          const [posts, polls, stories] = await Promise.all([
            fetchPosts(cursor, postsLimit),
            fetchPolls(cursor, pollsLimit),
            fetchStories(cursor, storiesLimit),
          ]);

          items = [...posts, ...polls, ...stories];
        }
        break;
    }

    // Score and rank items
    let scoredItems = await scoreAndRankContent(items, userId, sort);

    // Apply diversity filters for home tab
    if (tab === "home") {
      scoredItems = applyContentTypeDiversity(scoredItems);
      scoredItems = applyAuthorDiversity(scoredItems);
    }

    // Limit to requested count
    const resultItems = scoredItems.slice(0, limit);

    // Determine next cursor and hasMore
    const nextCursor =
      resultItems.length > 0
        ? resultItems[resultItems.length - 1]?._id
        : undefined;
    const hasMore = scoredItems.length > limit;

    const response: IFeedResponse = {
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

    return res.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("Error fetching for you feed:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET NEW CONTENT COUNT
// =========================
export const getNewContentCount = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const query = req.query as unknown as NewCountQuerySchemaType;
    const { feedType, tab, since } = query;

    // Build base query
    const baseQuery: any = {
      _id: { $gt: since },
    };

    // Get following list if needed
    let followingIds: string[] = [];
    if (feedType === "following") {
      const followingSet = await getUserFollowing(userId);
      followingIds = Array.from(followingSet);

      if (followingIds.length === 0) {
        return res.json({
          success: true,
          data: { count: 0 },
        });
      }
    }

    let count = 0;

    // Count based on tab and feed type
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

      case "stories":
        {
          const now = new Date();
          if (feedType === "following") {
            count = await Story.countDocuments({
              ...baseQuery,
              userId: { $in: followingIds },
              status: "published",
              expiresAt: { $gt: now },
            });
          } else {
            count = await Story.countDocuments({
              ...baseQuery,
              status: "published",
              expiresAt: { $gt: now },
            });
          }
        }
        break;

      case "home":
      default:
        {
          // Count all content types
          const now = new Date();
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
                expiresAt: { $gt: now },
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
                expiresAt: { $gt: now },
              }),
            ]);
          }

          count = postCount + pollCount + storyCount;
        }
        break;
    }

    return res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    console.error("Error fetching new content count:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
