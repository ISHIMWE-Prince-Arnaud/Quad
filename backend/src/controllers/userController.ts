import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Post from '../models/Post';
import Poll from '../models/Poll';
import Comment from '../models/Comment';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
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
const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'quad/profiles',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        ],
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
 * Get user profile by username
 * GET /api/users/:username
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select('-password');
  if (!user) {
    throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
  }

  // Get user's posts
  const posts = await Post.find({ author: user._id })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });

  // Get user's polls
  const polls = await Poll.find({ author: user._id })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });

  // Get user's comments
  const comments = await Comment.find({ author: user._id })
    .populate('author', 'username profilePicture')
    .populate('post', 'mediaUrl')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
    posts,
    polls,
    comments,
  });
});

/**
 * Update profile picture
 * PUT /api/users/me/profile-picture
 */
export const updateProfilePicture = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;

  if (!file) {
    throw new BadRequestError(
      'Profile picture is required',
      ErrorCode.FILE_REQUIRED
    );
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer);

    // Update user
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
    }

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.json({
      success: true,
      profilePicture: user.profilePicture,
    });
  } catch (error: any) {
    if (error.http_code) {
      throw new InternalServerError(
        'Failed to upload profile picture',
        ErrorCode.CLOUDINARY_ERROR,
        { cloudinaryError: error.message }
      );
    }
    throw error;
  }
});
