import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Post from '../models/Post';
import Comment from '../models/Comment';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
import { io } from '../server';

/**
 * Helper function to upload file to Cloudinary
 */
const uploadToCloudinary = (buffer: Buffer, resourceType: 'image' | 'video'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'quad/posts',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Get all posts
 * GET /api/posts
 */
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const posts = await Post.find()
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new post
 * POST /api/posts
 */
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Media file is required' });
      return;
    }

    // Determine media type
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer, mediaType);

    // Create post
    const post = new Post({
      author: req.user._id,
      mediaUrl: uploadResult.secure_url,
      mediaType,
      caption: caption || '',
      likes: [],
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'username profilePicture');

    // Emit socket event for real-time update
    io.emit('new_post', post);

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

/**
 * Like/unlike a post
 * POST /api/posts/:id/like
 */
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user already liked
    const likeIndex = post.likes.findIndex(like => like.toString() === userId.toString());

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('author', 'username profilePicture');

    // Emit socket event for real-time update
    io.emit('update_post_likes', { postId: id, likes: post.likes });

    res.json(post);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add comment to post
 * POST /api/posts/:id/comment
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Comment content is required' });
      return;
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = new Comment({
      post: id,
      author: req.user._id,
      content: content.trim(),
    });

    await comment.save();
    await comment.populate('author', 'username profilePicture');

    // Emit socket event for real-time update
    io.emit('new_comment', { postId: id, comment });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get comments for a post
 * GET /api/posts/:id/comments
 */
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ post: id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
