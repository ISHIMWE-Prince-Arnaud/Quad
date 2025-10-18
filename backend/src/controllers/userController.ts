import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import Post from '../models/Post';
import Poll from '../models/Poll';
import Comment from '../models/Comment';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

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
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
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
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update profile picture
 * PUT /api/users/me/profile-picture
 */
export const updateProfilePicture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Profile picture is required' });
      return;
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer);

    // Update user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    res.json({
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
