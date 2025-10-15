import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import cron from 'node-cron';
import Post from './models/Post.js';
import User from './models/User.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Cron job: Run every Monday at midnight to mark top posts of previous week
cron.schedule('0 0 * * 1', async () => {
  try {
    console.log('🔄 Running weekly top posts update...');
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Reset all isTopPost flags
    await Post.updateMany({}, { isTopPost: false });
    
    // Find top 10 posts of the week
    const topPosts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
          isFlagged: false,
        },
      },
      {
        $addFields: {
          totalReactions: {
            $add: ['$reactions.laugh', '$reactions.cry', '$reactions.love', '$reactions.angry'],
          },
        },
      },
      { $sort: { totalReactions: -1 } },
      { $limit: 10 },
    ]);
    
    // Mark them as top posts
    const topPostIds = topPosts.map(post => post._id);
    await Post.updateMany(
      { _id: { $in: topPostIds } },
      { isTopPost: true }
    );
    
    // Award badges to top post creators
    for (const post of topPosts.slice(0, 3)) {
      await User.findByIdAndUpdate(
        post.userId,
        { $addToSet: { badges: 'TopPost' } }
      );
    }
    
    // Award "ActiveUser" badge to users with 10+ posts this week
    const activeUsers = await Post.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 10 } } },
    ]);
    
    for (const user of activeUsers) {
      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { badges: 'ActiveUser' } }
      );
    }
    
    console.log('✅ Weekly update completed!');
  } catch (error) {
    console.error('❌ Error in cron job:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
