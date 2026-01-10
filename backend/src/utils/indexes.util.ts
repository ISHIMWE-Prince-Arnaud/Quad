import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { logger } from "./logger.util.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { ChatMessage } from "../models/ChatMessage.model.js";
import { MessageReaction } from "../models/MessageReaction.model.js";
import { Follow } from "../models/Follow.model.js";
import { Notification } from "../models/Notification.model.js";
import { Reaction } from "../models/Reaction.model.js";
import { SearchHistory } from "../models/SearchHistory.model.js";
import { SearchAnalytics } from "../models/SearchAnalytics.model.js";
import { Comment } from "../models/Comment.model.js";
import { CommentLike } from "../models/CommentLike.model.js";
import { Bookmark } from "../models/Bookmark.model.js";
import { ProfileView } from "../models/ProfileView.model.js";
import { FollowerHistory } from "../models/FollowerHistory.model.js";

/**
 * Ensures all database indexes are created.
 * This should be called once when the server starts.
 * 
 * Mongoose creates indexes in the background by default,
 * but calling this explicitly ensures they're set up correctly.
 */
export const ensureIndexes = async (): Promise<void> => {
  try {
    // Skip in production if SKIP_INDEX_CREATION is set
    if (process.env.SKIP_INDEX_CREATION === "true") {
      logger.info("Skipping index creation (SKIP_INDEX_CREATION=true)");
      return;
    }
    
    logger.info("Creating database indexes...");
    
    // Create indexes for User model
    await User.createIndexes();
    logger.info("User model indexes created");
    
    // Create indexes for Post model
    await Post.createIndexes();
    logger.info("Post model indexes created");
    
    // Create indexes for Story model
    await Story.createIndexes();
    logger.info("Story model indexes created");
    
    // Create indexes for Poll model
    await Poll.createIndexes();
    logger.info("Poll model indexes created");
    
    // Create indexes for ChatMessage model
    await ChatMessage.createIndexes();
    logger.info("ChatMessage model indexes created");
    
    // Create indexes for MessageReaction model
    await MessageReaction.createIndexes();
    logger.info("MessageReaction model indexes created");
    
    // Create indexes for Follow model
    await Follow.createIndexes();
    logger.info("Follow model indexes created");
    
    // Create indexes for Notification model
    await Notification.createIndexes();
    logger.info("Notification model indexes created");
    
    // Create indexes for Reaction model
    await Reaction.createIndexes();
    logger.info("Reaction model indexes created");

    // Create indexes for Bookmark model
    await Bookmark.createIndexes();
    logger.info("Bookmark model indexes created");

    await ProfileView.createIndexes();
    logger.info("ProfileView model indexes created");

    await FollowerHistory.createIndexes();
    logger.info("FollowerHistory model indexes created");
    
    // Create indexes for SearchHistory model
    await SearchHistory.createIndexes();
    logger.info("SearchHistory model indexes created");
    
    // Create indexes for SearchAnalytics model
    await SearchAnalytics.createIndexes();
    logger.info("SearchAnalytics model indexes created");
    
    // Create indexes for Comment model
    await Comment.createIndexes();
    logger.info("Comment model indexes created");
    
    // Create indexes for CommentLike model
    await CommentLike.createIndexes();
    logger.info("CommentLike model indexes created");
    
    logger.info("All database indexes created successfully");
  } catch (error) {
    logger.error("Error creating indexes", error);
    // Don't throw - let the app continue running
    // Indexes will be created in background anyway
  }
};

/**
 * Lists all indexes for debugging purposes
 */
export const listIndexes = async (): Promise<void> => {
  try {
    logger.info("Current Database Indexes:");
    
    const userIndexes = await User.collection.getIndexes();
    logger.info("User Model Indexes:", userIndexes);
    
    const postIndexes = await Post.collection.getIndexes();
    logger.info("Post Model Indexes:", postIndexes);
    
    const storyIndexes = await Story.collection.getIndexes();
    logger.info("Story Model Indexes:", storyIndexes);
    
    const pollIndexes = await Poll.collection.getIndexes();
    logger.info("Poll Model Indexes:", pollIndexes);
    
    const chatMessageIndexes = await ChatMessage.collection.getIndexes();
    logger.info("ChatMessage Model Indexes:", chatMessageIndexes);
    
    const messageReactionIndexes = await MessageReaction.collection.getIndexes();
    logger.info("MessageReaction Model Indexes:", messageReactionIndexes);
    
    const followIndexes = await Follow.collection.getIndexes();
    logger.info("Follow Model Indexes:", followIndexes);
    
    const notificationIndexes = await Notification.collection.getIndexes();
    logger.info("Notification Model Indexes:", notificationIndexes);
    
    const reactionIndexes = await Reaction.collection.getIndexes();
    logger.info("Reaction Model Indexes:", reactionIndexes);
    
    const commentIndexes = await Comment.collection.getIndexes();
    logger.info("Comment Model Indexes:", commentIndexes);
    
    const commentLikeIndexes = await CommentLike.collection.getIndexes();
    logger.info("CommentLike Model Indexes:", commentLikeIndexes);
    
  } catch (error) {
    logger.error("Error listing indexes", error);
  }
};
