import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
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
      console.log("⏭️  Skipping index creation (SKIP_INDEX_CREATION=true)");
      return;
    }
    
    console.log("📊 Creating database indexes...");
    
    // Create indexes for User model
    await User.createIndexes();
    console.log("✅ User model indexes created");
    
    // Create indexes for Post model
    await Post.createIndexes();
    console.log("✅ Post model indexes created");
    
    // Create indexes for Story model
    await Story.createIndexes();
    console.log("✅ Story model indexes created");
    
    // Create indexes for Poll model
    await Poll.createIndexes();
    console.log("✅ Poll model indexes created");
    
    // Create indexes for ChatMessage model
    await ChatMessage.createIndexes();
    console.log("✅ ChatMessage model indexes created");
    
    // Create indexes for MessageReaction model
    await MessageReaction.createIndexes();
    console.log("✅ MessageReaction model indexes created");
    
    // Create indexes for Follow model
    await Follow.createIndexes();
    console.log("✅ Follow model indexes created");
    
    // Create indexes for Notification model
    await Notification.createIndexes();
    console.log("✅ Notification model indexes created");
    
    // Create indexes for Reaction model
    await Reaction.createIndexes();
    console.log("✅ Reaction model indexes created");
    
    // Create indexes for SearchHistory model
    await SearchHistory.createIndexes();
    console.log("✅ SearchHistory model indexes created");
    
    // Create indexes for SearchAnalytics model
    await SearchAnalytics.createIndexes();
    console.log("✅ SearchAnalytics model indexes created");
    
    // Create indexes for Comment model
    await Comment.createIndexes();
    console.log("✅ Comment model indexes created");
    
    // Create indexes for CommentLike model
    await CommentLike.createIndexes();
    console.log("✅ CommentLike model indexes created");
    
    console.log("📊 All database indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    // Don't throw - let the app continue running
    // Indexes will be created in background anyway
  }
};

/**
 * Lists all indexes for debugging purposes
 */
export const listIndexes = async (): Promise<void> => {
  try {
    console.log("\n📋 Current Database Indexes:");
    
    const userIndexes = await User.collection.getIndexes();
    console.log("\n👤 User Model Indexes:");
    console.log(JSON.stringify(userIndexes, null, 2));
    
    const postIndexes = await Post.collection.getIndexes();
    console.log("\n📝 Post Model Indexes:");
    console.log(JSON.stringify(postIndexes, null, 2));
    
    const storyIndexes = await Story.collection.getIndexes();
    console.log("\n📖 Story Model Indexes:");
    console.log(JSON.stringify(storyIndexes, null, 2));
    
    const pollIndexes = await Poll.collection.getIndexes();
    console.log("\n🗳️  Poll Model Indexes:");
    console.log(JSON.stringify(pollIndexes, null, 2));
    
    const chatMessageIndexes = await ChatMessage.collection.getIndexes();
    console.log("\n💬 ChatMessage Model Indexes:");
    console.log(JSON.stringify(chatMessageIndexes, null, 2));
    
    const messageReactionIndexes = await MessageReaction.collection.getIndexes();
    console.log("\n❤️  MessageReaction Model Indexes:");
    console.log(JSON.stringify(messageReactionIndexes, null, 2));
    
    const followIndexes = await Follow.collection.getIndexes();
    console.log("\n👥 Follow Model Indexes:");
    console.log(JSON.stringify(followIndexes, null, 2));
    
    const notificationIndexes = await Notification.collection.getIndexes();
    console.log("\n🔔 Notification Model Indexes:");
    console.log(JSON.stringify(notificationIndexes, null, 2));
    
    const reactionIndexes = await Reaction.collection.getIndexes();
    console.log("\n👍 Reaction Model Indexes:");
    console.log(JSON.stringify(reactionIndexes, null, 2));
    
    const commentIndexes = await Comment.collection.getIndexes();
    console.log("\n💬 Comment Model Indexes:");
    console.log(JSON.stringify(commentIndexes, null, 2));
    
    const commentLikeIndexes = await CommentLike.collection.getIndexes();
    console.log("\n❤️ CommentLike Model Indexes:");
    console.log(JSON.stringify(commentLikeIndexes, null, 2));
    
  } catch (error) {
    console.error("❌ Error listing indexes:", error);
  }
};
