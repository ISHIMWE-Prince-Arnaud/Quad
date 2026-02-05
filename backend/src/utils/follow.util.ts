import { Follow } from "../models/Follow.model.js";
import { User } from "../models/User.model.js";
import type { IFollowStats } from "../types/follow.types.js";

/**
 * Check if a user is following another user
 */
export const isFollowing = async (
  userId: string,
  followingId: string,
): Promise<boolean> => {
  const follow = await Follow.findOne({ userId, followingId });
  return !!follow;
};

/**
 * Check if two users follow each other (mutual follow)
 */
export const isMutualFollow = async (
  userId: string,
  otherUserId: string,
): Promise<boolean> => {
  const [following, followedBy] = await Promise.all([
    Follow.findOne({ userId, followingId: otherUserId }),
    Follow.findOne({ userId: otherUserId, followingId: userId }),
  ]);
  return !!following && !!followedBy;
};

/**
 * Get follow statistics for a user
 */
export const getFollowStats = async (
  targetUserId: string,
  currentUserId?: string,
): Promise<IFollowStats> => {
  // Get user's follower and following counts
  const user = await User.findOne({ clerkId: targetUserId }).select(
    "followersCount followingCount",
  );

  if (!user) {
    return {
      followersCount: 0,
      followingCount: 0,
      mutualFollows: 0,
      isFollowing: false,
      isFollowedBy: false,
      isMutual: false,
    };
  }

  // If no current user, return basic stats
  if (!currentUserId || currentUserId === targetUserId) {
    const followersCount = user.followersCount || 0;
    const followingCount = user.followingCount || 0;
    return {
      followersCount,
      followingCount,
      mutualFollows: 0,
      isFollowing: false,
      isFollowedBy: false,
      isMutual: false,
    };
  }

  // Check follow relationship
  const [followingCheck, followedByCheck] = await Promise.all([
    Follow.findOne({ userId: currentUserId, followingId: targetUserId }),
    Follow.findOne({ userId: targetUserId, followingId: currentUserId }),
  ]);

  const following = !!followingCheck;
  const followedBy = !!followedByCheck;
  const followersCount = user.followersCount || 0;
  const followingCount = user.followingCount || 0;
  const mutualIds = await getMutualFollowIds(currentUserId, targetUserId);

  return {
    followersCount,
    followingCount,
    mutualFollows: mutualIds.length,
    isFollowing: following,
    isFollowedBy: followedBy,
    isMutual: following && followedBy,
  };
};

/**
 * Get mutual follows between two users
 */
export const getMutualFollowIds = async (
  userId: string,
  otherUserId: string,
): Promise<string[]> => {
  // Get users that both users follow
  const [userFollowing, otherUserFollowing] = await Promise.all([
    Follow.find({ userId }).select("followingId"),
    Follow.find({ userId: otherUserId }).select("followingId"),
  ]);

  const userFollowingIds = new Set(userFollowing.map((f) => f.followingId));
  const mutualIds = otherUserFollowing
    .filter((f) => userFollowingIds.has(f.followingId))
    .map((f) => f.followingId);

  return mutualIds;
};

/**
 * Update user follow counts
 */
export const updateFollowCounts = async (
  userId: string,
  followingId: string,
  increment: boolean,
): Promise<void> => {
  const change = increment ? 1 : -1;

  await Promise.all([
    // Update follower count for the user being followed
    User.updateOne({ clerkId: followingId }, [
      {
        $set: {
          followersCount: {
            $max: [0, { $add: ["$followersCount", change] }],
          },
        },
      },
    ]),
    // Update following count for the user who is following
    User.updateOne({ clerkId: userId }, [
      {
        $set: {
          followingCount: {
            $max: [0, { $add: ["$followingCount", change] }],
          },
        },
      },
    ]),
  ]);
};
