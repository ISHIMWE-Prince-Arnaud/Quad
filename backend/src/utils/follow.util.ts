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
      isFollowing: false,
    };
  }

  // If no current user, return basic stats
  if (!currentUserId || currentUserId === targetUserId) {
    const followersCount = user.followersCount || 0;
    const followingCount = user.followingCount || 0;
    return {
      followersCount,
      followingCount,
      isFollowing: false,
    };
  }

  // Check follow relationship
  const followingCheck = await Follow.findOne({
    userId: currentUserId,
    followingId: targetUserId,
  });

  const following = !!followingCheck;
  const followersCount = user.followersCount || 0;
  const followingCount = user.followingCount || 0;

  return {
    followersCount,
    followingCount,
    isFollowing: following,
  };
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
