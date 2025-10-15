import User from '../models/User.js';
import Post from '../models/Post.js';

// @desc    Get leaderboard data
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Top 5 Funniest of the Week (posts with most laugh reactions)
    const topFunny = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
          isFlagged: false,
        },
      },
      { $sort: { 'reactions.laugh': -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          caption: 1,
          mediaUrl: 1,
          reactions: 1,
          'user.username': 1,
          'user.avatar': 1,
        },
      },
    ]);

    // Most Active Users (by total posts and reactions)
    const activeUsers = await User.find()
      .select('username avatar totalPosts totalReactions badges')
      .sort({ totalReactions: -1, totalPosts: -1 })
      .limit(5);

    // Most Reacted Posts (all reactions combined)
    const topReacted = await Post.aggregate([
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
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          caption: 1,
          mediaUrl: 1,
          reactions: 1,
          totalReactions: 1,
          'user.username': 1,
          'user.avatar': 1,
        },
      },
    ]);

    // Hall of Fame (users with special badges)
    const hallOfFame = await User.find({ badges: { $exists: true, $ne: [] } })
      .select('username avatar badges totalPosts totalReactions')
      .sort({ badges: -1, totalReactions: -1 })
      .limit(10);

    res.json({
      topFunny,
      activeUsers,
      topReacted,
      hallOfFame,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile with stats
// @route   GET /api/leaderboard/user/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ userId: req.params.id, isFlagged: false })
      .sort({ createdAt: -1 })
      .limit(10);

    // Find top post
    const topPost = posts.reduce((max, post) => {
      const total = post.reactions.laugh + post.reactions.cry + post.reactions.love + post.reactions.angry;
      const maxTotal = max ? max.reactions.laugh + max.reactions.cry + max.reactions.love + max.reactions.angry : 0;
      return total > maxTotal ? post : max;
    }, null);

    res.json({
      user,
      posts,
      topPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
