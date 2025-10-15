import Post from "../models/Post.js";
import User from "../models/User.js";
import Theme from "../models/Theme.js";
import cloudinary from "../config/cloudinary.js";
import { sanitizeText } from "../utils/sanitize.js";
import { getIO } from "../config/socket.js";

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const { theme, sort = "newest" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (theme) {
      query.theme = theme;
    }

    let sortOption = {};
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "top") {
      sortOption = { totalReactions: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate("userId", "username avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Add total reactions count
    const postsWithTotal = posts.map((post) => ({
      ...post.toObject(),
      totalReactions:
        post.reactions.laugh +
        post.reactions.cry +
        post.reactions.love +
        post.reactions.angry,
    }));

    const total = await Post.countDocuments(query);

    res.json({
      posts: postsWithTotal,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top posts of the week
// @route   GET /api/posts/top
// @access  Public
export const getTopPosts = async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $addFields: {
          totalReactions: {
            $add: [
              "$reactions.laugh",
              "$reactions.cry",
              "$reactions.love",
              "$reactions.angry",
            ],
          },
        },
      },
      { $sort: { totalReactions: -1 } },
      { $limit: 10 },
    ]);

    await Post.populate(posts, { path: "userId", select: "username avatar" });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload an image or video" });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "quad_posts",
      },
      async (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Upload failed", error: error.message });
        }

        try {

          // Get current active theme
          const currentTheme = await Theme.findOne({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
          });

          const post = await Post.create({
            userId: req.user._id,
            caption: sanitizeText(caption),
            mediaUrl: result.secure_url,
            mediaType: result.resource_type === "video" ? "video" : "image",
            theme: currentTheme ? currentTheme.title : null,
          });

          // Update user's total posts
          await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalPosts: 1 },
          });

          const populatedPost = await Post.findById(post._id).populate(
            "userId",
            "username avatar"
          );

          // Emit new post event
          getIO().emit("post:new", populatedPost);

          res.status(201).json(populatedPost);
        } catch (dbError) {
          res.status(500).json({ message: dbError.message });
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    React to post
// @route   POST /api/posts/:id/react
// @access  Private
export const reactToPost = async (req, res) => {
  try {
    const { emoji } = req.body;
    const validEmojis = ["laugh", "cry", "love", "angry"];

    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already reacted
    const existingReaction = post.reactedBy.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      // Remove old reaction
      post.reactions[existingReaction.emoji] -= 1;

      if (existingReaction.emoji === emoji) {
        // Remove reaction entirely
        post.reactedBy = post.reactedBy.filter(
          (r) => r.userId.toString() !== req.user._id.toString()
        );
      } else {
        // Update to new reaction
        existingReaction.emoji = emoji;
        post.reactions[emoji] += 1;
      }
    } else {
      // Add new reaction
      post.reactions[emoji] += 1;
      post.reactedBy.push({ userId: req.user._id, emoji });
    }

    await post.save();

    // Update post owner's total reactions by aggregating all their posts
    const userPosts = await Post.find({ userId: post.userId });
    const totalReactions = userPosts.reduce((sum, p) => {
      return (
        sum +
        p.reactions.laugh +
        p.reactions.cry +
        p.reactions.love +
        p.reactions.angry
      );
    }, 0);

    await User.findByIdAndUpdate(post.userId, {
      totalReactions: totalReactions,
    });

    // Emit reaction event
    getIO().emit("post:reaction", {
      postId: post._id,
      reaction: emoji,
      userId: req.user._id,
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId: req.user._id,
      text: sanitizeText(text),
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("userId", "username avatar")
      .populate("comments.userId", "username avatar");

    // Emit new comment event
    const newComment =
      populatedPost.comments[populatedPost.comments.length - 1];
    getIO().emit("post:newComment", {
      postId: post._id,
      comment: {
        ...newComment.toObject(),
        userId: await User.findById(newComment.userId).select(
          "username avatar"
        ),
      },
    });

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      userId: req.params.userId,
    })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
