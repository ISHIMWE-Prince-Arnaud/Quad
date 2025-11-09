import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";

/**
 * Ensures all database indexes are created.
 * This should be called once when the server starts.
 * 
 * Mongoose creates indexes in the background by default,
 * but calling this explicitly ensures they're set up correctly.
 */
export const ensureIndexes = async (): Promise<void> => {
  try {
    console.log("📊 Creating database indexes...");
    
    // Create indexes for User model
    await User.createIndexes();
    console.log("✅ User model indexes created");
    
    // Create indexes for Post model
    await Post.createIndexes();
    console.log("✅ Post model indexes created");
    
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
    
  } catch (error) {
    console.error("❌ Error listing indexes:", error);
  }
};
