import { Post } from "../models/Post.model.js";
import { Poll } from "../models/Poll.model.js";
import { Story } from "../models/Story.model.js";
import { User } from "../models/User.model.js";
import { Follow } from "../models/Follow.model.js";
import { DatabaseService } from "../services/database.service.js";
import { logger } from "./logger.util.js";
import type { IPost } from "../types/post.types.js";
import type { IPoll } from "../types/poll.types.js";
import type { IStory } from "../types/story.types.js";
import type {
  FeedItemType,
  ContentTab,
  IRawContentItem,
  IFeedItem,
  ContentPriority,
  IScoringWeights,
  FeedSort,
} from "../types/feed.types.js";

/**
 * Default scoring weights
 */
const DEFAULT_WEIGHTS: IScoringWeights = {
  recency: 0.4,
  engagement: 0.3,
  following: 0.2,
  popularity: 0.1,
};

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

/**
 * Calculate time decay score (newer = higher)
 */
export const calculateRecencyScore = (createdAt: Date): number => {
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (ageInHours < 1) return 1.0; // < 1 hour
  if (ageInHours < 24) return 0.5; // < 1 day
  if (ageInHours < 168) return 0.1; // < 7 days
  return 0.01; // > 7 days
};

/**
 * Calculate engagement score (normalized)
 */
export const calculateEngagementScore = (
  item: IRawContentItem,
  maxEngagement: number
): number => {
  if (maxEngagement === 0) return 0;

  let engagement = item.reactionsCount + item.commentsCount;
  if (item.type === "poll" && item.totalVotes) {
    engagement += item.totalVotes * 0.5; // Votes count less than reactions/comments
  }

  return Math.min(engagement / maxEngagement, 1.0);
};

/**
 * Calculate author popularity score (normalized)
 */
export const calculatePopularityScore = (
  followerCount: number,
  maxFollowers: number
): number => {
  if (maxFollowers === 0) return 0;
  return Math.min(followerCount / maxFollowers, 1.0);
};

/**
 * Calculate final ranking score
 */
export const calculateContentScore = (
  item: IRawContentItem,
  isFollowing: boolean,
  authorFollowerCount: number,
  maxEngagement: number,
  maxFollowers: number,
  weights: IScoringWeights = DEFAULT_WEIGHTS
): number => {
  const recencyScore = calculateRecencyScore(item.createdAt);
  const engagementScore = calculateEngagementScore(item, maxEngagement);
  const followingBoost = isFollowing ? 2.0 : 1.0;
  const popularityScore = calculatePopularityScore(
    authorFollowerCount,
    maxFollowers
  );

  return (
    recencyScore * weights.recency +
    engagementScore * weights.engagement +
    followingBoost * weights.following +
    popularityScore * weights.popularity
  );
};

/**
 * Fetch posts with filters and populated author data (prevents N+1 queries)
 */
export const fetchPosts = async (
  cursor?: string,
  limit: number = 20,
  maxAgeDays: number = 30
): Promise<IRawContentItem[]> => {
  try {
    const maxAgeDate = new Date();
    maxAgeDate.setDate(maxAgeDate.getDate() - maxAgeDays);

    const query: Record<string, unknown> = {
      createdAt: { $gte: maxAgeDate },
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    // Use database service to get content with author populated
    const posts = await DatabaseService.getContentWithAuthor(
      Post,
      query,
      { sort: { createdAt: -1 }, limit }
    );

    return posts.map((post) => {
      const p = post as unknown as Record<string, unknown>;
      return {
      _id: p._id,
      type: "post" as FeedItemType,
      content: post,
      createdAt: (p.createdAt as Date | undefined) || new Date(),
      authorId: getContentAuthorId(post),
      reactionsCount: (p.reactionsCount as number | undefined) || 0,
      commentsCount: (p.commentsCount as number | undefined) || 0,
    };
    });
  } catch (error) {
    logger.error("Error fetching posts for feed", error);
    return [];
  }
};

/**
 * Fetch polls with filters
 */
export const fetchPolls = async (
  cursor?: string,
  limit: number = 20,
  maxAgeDays: number = 30,
  excludeClosed: boolean = true
): Promise<IRawContentItem[]> => {
  const maxAgeDate = new Date();
  maxAgeDate.setDate(maxAgeDate.getDate() - maxAgeDays);

  const query: Record<string, unknown> = {
    createdAt: { $gte: maxAgeDate },
  };

  if (excludeClosed) {
    query.status = { $ne: "closed" };
  }

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const polls = await Poll.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return polls.map((poll) => ({
    _id: poll._id,
    type: "poll" as FeedItemType,
    content: poll,
    createdAt: poll.createdAt,
    authorId: getContentAuthorId(poll),
    reactionsCount: poll.reactionsCount || 0,
    commentsCount: poll.commentsCount || 0,
    totalVotes: poll.totalVotes || 0,
  }));
};

/**
 * Fetch stories with filters
 */
export const fetchStories = async (
  cursor?: string,
  limit: number = 20
): Promise<IRawContentItem[]> => {
  const query: Record<string, unknown> = {
    status: "published",
  };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const stories = await Story.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return stories.map((story) => ({
    _id: story._id,
    type: "story" as FeedItemType,
    content: story,
    createdAt: story.createdAt || new Date(),
    authorId: getContentAuthorId(story),
    reactionsCount: story.reactionsCount || 0,
    commentsCount: story.commentsCount || 0,
  }));
};

/**
 * Fetch content based on tab
 */
export const fetchContentByTab = async (
  tab: ContentTab,
  cursor?: string,
  limit: number = 20
): Promise<IRawContentItem[]> => {
  switch (tab) {
    case "posts":
      return await fetchPosts(cursor, limit);
    case "polls":
      return await fetchPolls(cursor, limit);
    case "stories":
      return await fetchStories(cursor, limit);
    case "home":
    default:
      {
        // Fetch from all content types
        const [posts, polls, stories] = await Promise.all([
          fetchPosts(cursor, Math.ceil(limit * 0.5)),
          fetchPolls(cursor, Math.ceil(limit * 0.3)),
          fetchStories(cursor, Math.ceil(limit * 0.2)),
        ]);
        return [...posts, ...polls, ...stories];
      }
  }
};

/**
 * Get user's following list
 */
export const getUserFollowing = async (
  userId: string
): Promise<Set<string>> => {
  const follows = await Follow.find({ userId }).select("followingId").lean();
  return new Set(follows.map((f) => f.followingId));
};

/**
 * Get author follower counts
 */
export const getAuthorFollowerCounts = async (
  authorIds: string[]
): Promise<Map<string, number>> => {
  const users = await User.find({ clerkId: { $in: authorIds } })
    .select("clerkId followersCount")
    .lean();

  const counts = new Map<string, number>();
  users.forEach((user) => {
    counts.set(user.clerkId, user.followersCount || 0);
  });
  return counts;
};

/**
 * Score and rank content items
 */
export const scoreAndRankContent = async (
  items: IRawContentItem[],
  userId: string,
  sort: FeedSort = "newest"
): Promise<IFeedItem[]> => {
  if (items.length === 0) return [];

  // Get user's following list
  const followingSet = await getUserFollowing(userId);

  // Get unique author IDs
  const authorIds = [...new Set(items.map((item) => item.authorId))];

  // Get author follower counts
  const followerCounts = await getAuthorFollowerCounts(authorIds);

  // Calculate max values for normalization
  const maxEngagement = Math.max(
    ...items.map((item) => item.reactionsCount + item.commentsCount + (item.totalVotes || 0))
  );
  const maxFollowers = Math.max(...Array.from(followerCounts.values()));

  // Get author details for response
  const authors = await User.find({ clerkId: { $in: authorIds } })
    .select("clerkId username profileImage")
    .lean();
  const authorMap = new Map(authors.map((a) => [a.clerkId, a]));

  // Score each item
  const scoredItems: IFeedItem[] = items.map((item) => {
    const isFollowing = followingSet.has(item.authorId);
    const authorFollowerCount = followerCounts.get(item.authorId) || 0;

    let score = 1.0;
    if (sort === "trending") {
      score = calculateContentScore(
        item,
        isFollowing,
        authorFollowerCount,
        maxEngagement,
        maxFollowers
      );
    } else {
      // For newest, just use recency with following boost
      score = calculateRecencyScore(item.createdAt) * (isFollowing ? 1.5 : 1.0);
    }

    const author = authorMap.get(item.authorId);

    return {
      _id: String(item._id),
      type: item.type,
      content: item.content as IPost | IStory | IPoll,
      score,
      priority: isFollowing ? ("following" as ContentPriority) : ("discover" as ContentPriority),
      createdAt: item.createdAt,
      authorId: item.authorId,
      engagementMetrics: {
        reactions: item.reactionsCount,
        comments: item.commentsCount,
        votes: item.totalVotes || 0,
      },
      author: {
        clerkId: item.authorId,
        username: author?.username || "Unknown",
        profileImage: author?.profileImage,
      },
    };
  });

  // Sort by score (highest first)
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems;
};

/**
 * Apply author diversity (prevent same author dominating feed)
 */
export const applyAuthorDiversity = (items: IFeedItem[]): IFeedItem[] => {
  const result: IFeedItem[] = [];
  const recentAuthors: string[] = [];
  const MAX_CONSECUTIVE = 3;

  for (const item of items) {
    const authorId = item.author.clerkId;

    // Count how many recent items are from this author
    const consecutiveCount = recentAuthors.filter((id) => id === authorId).length;

    if (consecutiveCount >= MAX_CONSECUTIVE) {
      // Skip this item temporarily, will be added later
      continue;
    }

    result.push(item);
    recentAuthors.push(authorId);

    // Keep only last 5 authors in memory
    if (recentAuthors.length > 5) {
      recentAuthors.shift();
    }
  }

  // Add skipped items at the end
  const addedIds = new Set(result.map((item) => item._id));
  for (const item of items) {
    if (!addedIds.has(item._id)) {
      result.push(item);
    }
  }

  return result;
};

/**
 * Apply content type diversity for home tab
 */
export const applyContentTypeDiversity = (items: IFeedItem[]): IFeedItem[] => {
  const posts = items.filter((item) => item.type === "post");
  const polls = items.filter((item) => item.type === "poll");
  const stories = items.filter((item) => item.type === "story");

  const result: IFeedItem[] = [];
  let postIndex = 0,
    pollIndex = 0,
    storyIndex = 0;

  // Interleave: 2 posts, 1 poll, 1 story, repeat
  while (postIndex < posts.length || pollIndex < polls.length || storyIndex < stories.length) {
    // Add 2 posts
    if (postIndex < posts.length) {
      const post = posts[postIndex++];
      if (post) result.push(post);
    }
    if (postIndex < posts.length) {
      const post = posts[postIndex++];
      if (post) result.push(post);
    }

    // Add 1 poll
    if (pollIndex < polls.length) {
      const poll = polls[pollIndex++];
      if (poll) result.push(poll);
    }

    // Add 1 story
    if (storyIndex < stories.length) {
      const story = stories[storyIndex++];
      if (story) result.push(story);
    }
  }

  return result;
};
