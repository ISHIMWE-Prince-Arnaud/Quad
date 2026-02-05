import { Follow } from "../models/Follow.model.js";
import { User } from "../models/User.model.js";
import type { GetFollowListQuerySchemaType } from "../schemas/follow.schema.js";
import {
  getFollowStats as computeFollowStats,
  isFollowing,
  updateFollowCounts,
} from "../utils/follow.util.js";
import { getPaginatedData } from "../utils/pagination.util.js";
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

  static async getFollowers(
    currentUserId: string,
    targetUserId: string,
    query: GetFollowListQuerySchemaType,
  ) {
    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const result = await getPaginatedData(
      Follow,
      { followingId: targetUserId },
      {
        ...query,
        select: "userId createdAt",
      },
    );

    const followerIds = result.data.map((f: { userId: string }) => f.userId);

    const [followers, followStatusDocs] = await Promise.all([
      User.find({ clerkId: { $in: followerIds } })
        .select(
          "clerkId username firstName lastName profileImage bio isVerified",
        )
        .lean(),
      Follow.find({ userId: currentUserId, followingId: { $in: followerIds } })
        .select("followingId")
        .lean(),
    ]);

    const isFollowingSet = new Set(
      followStatusDocs.map((d: { followingId: string }) => d.followingId),
    );

    const followedAtMap = new Map<string, Date>();
    result.data.forEach((f: { userId: string; createdAt: Date }) => {
      followedAtMap.set(f.userId, f.createdAt);
    });

    const userByClerkId = new Map<string, Record<string, unknown>>();
    followers.forEach((u: { clerkId: string }) => {
      userByClerkId.set(u.clerkId, u as unknown as Record<string, unknown>);
    });

    const enrichedFollowers = followerIds
      .map((id) => {
        const u = userByClerkId.get(id);
        if (!u) return null;
        return {
          ...u,
          isFollowing: isFollowingSet.has(id),
          followedAt: followedAtMap.get(id)?.toISOString(),
        };
      })
      .filter(Boolean);

    return {
      data: enrichedFollowers,
      pagination: result.pagination,
    };
  }

  static async getFollowing(
    currentUserId: string,
    targetUserId: string,
    query: GetFollowListQuerySchemaType,
  ) {
    const user = await User.findOne({ clerkId: targetUserId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const result = await getPaginatedData(
      Follow,
      { userId: targetUserId },
      {
        ...query,
        select: "followingId createdAt",
      },
    );

    const followingIds = result.data.map(
      (f: { followingId: string }) => f.followingId,
    );

    const [following, followStatusDocs] = await Promise.all([
      User.find({ clerkId: { $in: followingIds } })
        .select(
          "clerkId username firstName lastName profileImage bio isVerified",
        )
        .lean(),
      Follow.find({ userId: currentUserId, followingId: { $in: followingIds } })
        .select("followingId")
        .lean(),
    ]);

    const isFollowingSet = new Set(
      followStatusDocs.map((d: { followingId: string }) => d.followingId),
    );

    const followedAtMap = new Map<string, Date>();
    result.data.forEach((f: { followingId: string; createdAt: Date }) => {
      followedAtMap.set(f.followingId, f.createdAt);
    });

    const userByClerkId = new Map<string, Record<string, unknown>>();
    following.forEach((u: { clerkId: string }) => {
      userByClerkId.set(u.clerkId, u as unknown as Record<string, unknown>);
    });

    const enrichedFollowing = followingIds
      .map((id) => {
        const u = userByClerkId.get(id);
        if (!u) return null;
        return {
          ...u,
          isFollowing: isFollowingSet.has(id),
          followedAt: followedAtMap.get(id)?.toISOString(),
        };
      })
      .filter(Boolean);

    return {
      data: enrichedFollowing,
      pagination: result.pagination,
    };
  }

  static async checkFollowing(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return {
        isFollowing: false,
      };
    }

    const following = await isFollowing(currentUserId, targetUserId);

    return {
      isFollowing: following,
    };
  }

  static async getFollowStats(currentUserId: string, targetUserId: string) {
    return await computeFollowStats(targetUserId, currentUserId);
  }
}
