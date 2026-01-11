import { Follow } from "../models/Follow.model.js";
import { User } from "../models/User.model.js";
import type { GetFollowListQuerySchemaType } from "../schemas/follow.schema.js";
import {
  getFollowStats,
  getMutualFollowIds,
  isFollowing,
  updateFollowCounts,
} from "../utils/follow.util.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";
import { AppError } from "../utils/appError.util.js";

export class FollowService {
  static async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const targetUser = await User.findOne({ clerkId: targetUserId });
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const alreadyFollowing = await isFollowing(currentUserId, targetUserId);
    if (alreadyFollowing) {
      throw new AppError("You are already following this user", 400);
    }

    await Follow.create({
      userId: currentUserId,
      followingId: targetUserId,
    });

    await updateFollowCounts(currentUserId, targetUserId, true);

    const currentUser = await User.findOne({ clerkId: currentUserId });

    await createNotification({
      userId: targetUserId,
      type: "follow",
      actorId: currentUserId,
      message: generateNotificationMessage("follow", currentUser?.username),
    });

    getSocketIO().emit("follow:new", {
      userId: currentUserId,
      followingId: targetUserId,
    });
  }

  static async unfollowUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new AppError("Invalid operation", 400);
    }

    const follow = await Follow.findOneAndDelete({
      userId: currentUserId,
      followingId: targetUserId,
    });

    if (!follow) {
      throw new AppError("You are not following this user", 404);
    }

    await updateFollowCounts(currentUserId, targetUserId, false);

    getSocketIO().emit("follow:removed", {
      userId: currentUserId,
      followingId: targetUserId,
    });
  }

  static async getFollowers(targetUserId: string, query: GetFollowListQuerySchemaType) {
    const { page, limit } = query;

    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ followingId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ followingId: targetUserId }),
    ]);

    const followerIds = follows.map((f) => f.userId);
    const followers = await User.find({ clerkId: { $in: followerIds } });

    return {
      data: followers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  static async getFollowing(targetUserId: string, query: GetFollowListQuerySchemaType) {
    const { page, limit } = query;

    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follow.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Follow.countDocuments({ userId: targetUserId }),
    ]);

    const followingIds = follows.map((f) => f.followingId);
    const following = await User.find({ clerkId: { $in: followingIds } });

    return {
      data: following,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  static async checkFollowing(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return {
        isFollowing: false,
        isFollowedBy: false,
        isMutual: false,
      };
    }

    const [following, followedBy] = await Promise.all([
      isFollowing(currentUserId, targetUserId),
      isFollowing(targetUserId, currentUserId),
    ]);

    return {
      isFollowing: following,
      isFollowedBy: followedBy,
      isMutual: following && followedBy,
    };
  }

  static async getMutualFollows(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return {
        mutualUsers: [],
        count: 0,
      };
    }

    const mutualIds = await getMutualFollowIds(currentUserId, targetUserId);
    const mutualUsers = await User.find({ clerkId: { $in: mutualIds } });

    return {
      mutualUsers,
      count: mutualUsers.length,
    };
  }

  static async getFollowStats(currentUserId: string, targetUserId: string) {
    return await getFollowStats(targetUserId, currentUserId);
  }
}
