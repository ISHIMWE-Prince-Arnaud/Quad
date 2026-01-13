import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { Reaction } from "../models/Reaction.model.js";
import type { IUserDocument } from "../models/User.model.js";
import type { IProfileStats, IUserProfile } from "../types/profile.types.js";

/**
 * Calculate profile statistics for a user
 */
export const calculateProfileStats = async (
  clerkId: string
): Promise<IProfileStats> => {
  // Run all queries in parallel for better performance
  const [postsCount, storiesCount, pollsCount, reactionsReceived] =
    await Promise.all([
      // Count posts by user
      Post.countDocuments({ userId: clerkId }),

      // Count stories by user
      Story.countDocuments({ userId: clerkId }),

      // Count polls by user
      Poll.countDocuments({ "author.clerkId": clerkId }),

      // Count reactions received on user's content
      // This includes reactions on posts, stories, and polls
      (async () => {
        const [postReactions, storyReactions, pollReactions] =
          await Promise.all([
            // Get user's posts
            Post.find({ userId: clerkId }).select("_id"),
            // Get user's stories
            Story.find({ userId: clerkId }).select("_id"),
            // Get user's polls
            Poll.find({ "author.clerkId": clerkId }).select("_id"),
          ]);

        const postIds = postReactions.map((p) => p._id);
        const storyIds = storyReactions.map((s) => s._id);
        const pollIds = pollReactions.map((p) => p._id);

        // Count reactions on all user's content
        const totalReactions = await Reaction.countDocuments({
          $or: [
            { contentType: "post", contentId: { $in: postIds } },
            { contentType: "story", contentId: { $in: storyIds } },
            { contentType: "poll", contentId: { $in: pollIds } },
          ],
        });

        return totalReactions;
      })(),
    ]);

  return {
    postsCount,
    storiesCount,
    pollsCount,
    reactionsReceived,
    followersCount: 0, // Will be populated from user document
    followingCount: 0, // Will be populated from user document
  };
};

/**
 * Format user profile with statistics
 */
export const formatUserProfile = (
  user: IUserDocument,
  stats: IProfileStats
): IUserProfile => {
  // Update stats with follow counts from user document
  stats.followersCount = user.followersCount || 0;
  stats.followingCount = user.followingCount || 0;

  const userId = typeof user._id === "string" ? user._id : user._id.toString();

  return {
    _id: userId,
    clerkId: user.clerkId,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    // Keep displayName for backwards compatibility
    displayName: user.displayName,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    bio: user.bio,
    isVerified: user.isVerified,
    followers: stats.followersCount,
    following: stats.followingCount,
    postsCount: stats.postsCount,
    storiesCount: stats.storiesCount,
    pollsCount: stats.pollsCount,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    joinedAt: user.createdAt,
    stats,
  };
};
