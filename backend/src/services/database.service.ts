/**
 * Shared database service to consolidate common queries and prevent N+1 problems
 */
import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { Comment } from "../models/Comment.model.js";
import { Reaction } from "../models/Reaction.model.js";
import { Follow } from "../models/Follow.model.js";
import { logger } from "../utils/logger.util.js";
import type { IUserDocument } from "../models/User.model.js";

export class DatabaseService {
  /**
   * Get user by clerk ID with error handling
   */
  static async getUserByClerkId(clerkId: string): Promise<IUserDocument | null> {
    try {
      return await User.findOne({ clerkId });
    } catch (error) {
      logger.error(`Failed to get user by clerkId: ${clerkId}`, error);
      return null;
    }
  }

  /**
   * Get user by ID with error handling
   */
  static async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      logger.error(`Failed to get user by ID: ${userId}`, error);
      return null;
    }
  }

  /**
   * Get multiple users by IDs (prevents N+1 queries)
   * TODO: Fix TypeScript lean() type issues
   */
  static async getUsersByIds(userIds: string[]): Promise<Map<string, any>> {
    try {
      const users = await User.find({ _id: { $in: userIds } });
      const userMap = new Map<string, any>();
      users.forEach(user => {
        userMap.set((user._id as any).toString(), user);
      });
      return userMap;
    } catch (error) {
      logger.error('Failed to get users by IDs', error);
      return new Map();
    }
  }

  /**
   * Get follow status between users
   */
  static async getFollowStatus(followerId: string, followingId: string): Promise<boolean> {
    try {
      const follow = await Follow.findOne({ 
        follower: followerId, 
        following: followingId 
      }).lean();
      return !!follow;
    } catch (error) {
      logger.error('Failed to get follow status', error);
      return false;
    }
  }

  /**
   * Get multiple follow statuses (prevents N+1 queries)
   */
  static async getMultipleFollowStatuses(
    followerId: string, 
    followingIds: string[]
  ): Promise<Map<string, boolean>> {
    try {
      const follows = await Follow.find({
        follower: followerId,
        following: { $in: followingIds }
      }).lean();

      const followMap = new Map<string, boolean>();
      followingIds.forEach(id => followMap.set(id, false));
      follows.forEach(follow => {
        followMap.set(follow.followingId.toString(), true);
      });

      return followMap;
    } catch (error) {
      logger.error('Failed to get multiple follow statuses', error);
      return new Map();
    }
  }

  /**
   * Get user reaction to content
   */
  static async getUserReaction(
    userId: string, 
    contentType: string, 
    contentId: string
  ): Promise<string | null> {
    try {
      const reaction = await Reaction.findOne({
        userId,
        contentType,
        contentId
      }).lean();
      return reaction?.type || null;
    } catch (error) {
      logger.error('Failed to get user reaction', error);
      return null;
    }
  }

  /**
   * Get multiple user reactions (prevents N+1 queries)
   */
  static async getMultipleUserReactions(
    userId: string,
    contentItems: Array<{ type: string; id: string }>
  ): Promise<Map<string, string>> {
    try {
      const queries = contentItems.map(item => ({
        userId,
        contentType: item.type,
        contentId: item.id
      }));

      const reactions = await Reaction.find({
        $or: queries
      }).lean();

      const reactionMap = new Map<string, string>();
      reactions.forEach(reaction => {
        const key = `${reaction.contentType}:${reaction.contentId}`;
        reactionMap.set(key, reaction.type);
      });

      return reactionMap;
    } catch (error) {
      logger.error('Failed to get multiple user reactions', error);
      return new Map();
    }
  }

  /**
   * Update content reaction count
   */
  static async updateReactionCount(
    contentType: string,
    contentId: string,
    increment: number = 1
  ): Promise<boolean> {
    try {
      switch (contentType) {
        case 'post':
          await Post.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
          break;
        case 'story':
          await Story.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
          break;
        case 'poll':
          await Poll.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
          break;
        case 'comment':
          await Comment.findByIdAndUpdate(contentId, { $inc: { reactionsCount: increment } });
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      logger.error('Failed to update reaction count', error);
      return false;
    }
  }

  /**
   * Update content comment count
   */
  static async updateCommentCount(
    contentType: string,
    contentId: string,
    increment: number = 1
  ): Promise<boolean> {
    try {
      switch (contentType) {
        case 'post':
          await Post.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
          break;
        case 'story':
          await Story.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
          break;
        case 'poll':
          await Poll.findByIdAndUpdate(contentId, { $inc: { commentsCount: increment } });
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      logger.error('Failed to update comment count', error);
      return false;
    }
  }

  /**
   * Update user follower count
   */
  static async updateFollowerCount(
    userId: string,
    increment: number = 1
  ): Promise<boolean> {
    try {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { followersCount: increment } }
      );
      return true;
    } catch (error) {
      logger.error('Failed to update follower count', error);
      return false;
    }
  }

  /**
   * Update user following count
   */
  static async updateFollowingCount(
    userId: string,
    increment: number = 1
  ): Promise<boolean> {
    try {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { followingCount: increment } }
      );
      return true;
    } catch (error) {
      logger.error('Failed to update following count', error);
      return false;
    }
  }

  /**
   * Get content with author populated (prevents N+1)
   */
  static async getContentWithAuthor(
    Model: any,
    query: any,
    options?: any
  ) {
    try {
      return await Model.find(query, null, options)
        .populate('author', 'username displayName profileImage')
        .lean();
    } catch (error) {
      logger.error('Failed to get content with author', error);
      return [];
    }
  }

  /**
   * Batch update operations
   */
  static async batchUpdate(
    Model: any,
    updates: Array<{ filter: any; update: any }>
  ): Promise<boolean> {
    try {
      const bulkOps = updates.map(({ filter, update }) => ({
        updateOne: {
          filter,
          update,
          upsert: false
        }
      }));

      await Model.bulkWrite(bulkOps);
      return true;
    } catch (error) {
      logger.error('Failed to perform batch update', error);
      return false;
    }
  }
}
