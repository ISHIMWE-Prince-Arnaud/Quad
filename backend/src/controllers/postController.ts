import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Post from '../models/Post';
import Comment from '../models/Comment';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
import { io } from '../server';
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  ErrorCode,
} from '../utils/ApiError';
import { asyncHandler } from '../middleware/errorHandler';

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
export const getPosts = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const posts = await Post.find()
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: posts.length,
    posts,
  });
});

/**
 * Create a new post
 * POST /api/posts
 */
export const createPost = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { caption } = req.body;
  const file = req.file;

  if (!file) {
    throw new BadRequestError(
      'Media file is required',
      ErrorCode.FILE_REQUIRED
    );
  }

  // Determine media type
  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

  try {
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

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error: any) {
    // Handle Cloudinary-specific errors
    if (error.http_code) {
      throw new InternalServerError(
        'Failed to upload media',
        ErrorCode.CLOUDINARY_ERROR,
        { cloudinaryError: error.message }
      );
    }
    throw error;
  }
});

/**
 * Like/unlike a post
 * POST /api/posts/:id/like
 */
export const likePost = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
  }

  // Check if user already liked
  const likeIndex = post.likes.findIndex(like => like.toString() === userId.toString());

  let action: 'liked' | 'unliked';
  if (likeIndex > -1) {
    // Unlike
    post.likes.splice(likeIndex, 1);
    action = 'unliked';
  } else {
    // Like
    post.likes.push(userId);
    action = 'liked';
  }

  await post.save();
  await post.populate('author', 'username profilePicture');

  // Emit socket event for real-time update
  io.emit('update_post_likes', { postId: id, likes: post.likes });

  res.json({
    success: true,
    action,
    post,
  });
});

/**
 * Add comment to post
 * POST /api/posts/:id/comment
 */
export const addComment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    throw new BadRequestError(
      'Comment content is required',
      ErrorCode.MISSING_FIELDS
    );
  }

  const post = await Post.findById(id);
  if (!post) {
    throw new NotFoundError('Post not found', ErrorCode.POST_NOT_FOUND);
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

  res.status(201).json({
    success: true,
    comment,
  });
});

/**
 * Get comments for a post
 * GET /api/posts/:id/comments
 */
export const getComments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const comments = await Comment.find({ post: id })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: comments.length,
    comments,
  });
});
