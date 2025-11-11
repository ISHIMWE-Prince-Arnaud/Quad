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
      Post.countDocuments({ "author.clerkId": clerkId }),

      // Count stories by user
      Story.countDocuments({ "author.clerkId": clerkId }),

      // Count polls by user
      Poll.countDocuments({ "author.clerkId": clerkId }),

      // Count reactions received on user's content
      // This includes reactions on posts, stories, and polls
      (async () => {
        const [postReactions, storyReactions, pollReactions] =
          await Promise.all([
            // Get user's posts
            Post.find({ "author.clerkId": clerkId }).select("_id"),
            // Get user's stories
            Story.find({ "author.clerkId": clerkId }).select("_id"),
            // Get user's polls
            Poll.find({ "author.clerkId": clerkId }).select("_id"),
          ]);

        const postIds = postReactions.map((p) => p._id);
        const storyIds = storyReactions.map((s) => s._id);
        const pollIds = pollReactions.map((p) => p._id);

        // Count reactions on all user's content
        const totalReactions = await Reaction.countDocuments({
          $or: [
            { contentType: "Post", contentId: { $in: postIds } },
            { contentType: "Story", contentId: { $in: storyIds } },
            { contentType: "Poll", contentId: { $in: pollIds } },
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
  };
};

/**
 * Format user profile with statistics
 */
export const formatProfileResponse = (
  user: IUserDocument,
  stats: IProfileStats
): IUserProfile => {
  return {
    clerkId: user.clerkId,
    username: user.username,
    email: user.email,
    displayName: user.displayName as any,
    profileImage: user.profileImage as any,
    bio: user.bio as any,
    createdAt: user.createdAt as any,
    updatedAt: user.updatedAt as any,
    stats,
  };
};
