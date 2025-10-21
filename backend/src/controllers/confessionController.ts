import { Request, Response } from 'express';
import Confession from '../models/Confession';
import { generateAnonymousIdentity } from '../utils/generateAvatar';
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
        folder: 'quad/confessions',
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
 * Get all confessions with pagination
 * GET /api/confessions?page=1&limit=20
 */
export const getConfessions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    throw new BadRequestError(
      'Invalid pagination parameters',
      ErrorCode.INVALID_INPUT,
      { page, limit, maxLimit: 100 }
    );
  }

  // Get total count for pagination metadata
  const totalConfessions = await Confession.countDocuments();
  const totalPages = Math.ceil(totalConfessions / limit);

  // Fetch paginated confessions
  const confessions = await Confession.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    confessions,
    pagination: {
      currentPage: page,
      totalPages,
      totalConfessions,
      confessionsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * Create a new confession
 * POST /api/confessions
 */
export const createConfession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { content, anonymousAuthorId } = req.body;
  const file = req.file;

  if (!content || content.trim() === '') {
    throw new BadRequestError(
      'Content is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['content'] }
    );
  }

  // Generate or reuse anonymous identity
  let identity;
  if (anonymousAuthorId) {
    // If user already has an anonymous ID from localStorage, they can provide it
    // Generate new username and avatar for this confession
    identity = generateAnonymousIdentity();
    identity.anonymousAuthorId = anonymousAuthorId;
  } else {
    // Generate completely new identity
    identity = generateAnonymousIdentity();
  }

  // Prepare confession data
  const confessionData: any = {
    ...identity,
    content: content.trim(),
    likes: [],
    thoughts: [],
  };

  // Upload media if provided
  if (file) {
    try {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      confessionData.mediaUrl = uploadResult.secure_url;
      confessionData.mediaType = mediaType;
    } catch (error: any) {
      throw new InternalServerError(
        'Failed to upload media',
        ErrorCode.CLOUDINARY_ERROR,
        { cloudinaryError: error.message }
      );
    }
  }

  // Create confession
  const confession = new Confession(confessionData);
  await confession.save();

  // Emit socket event for real-time update
  io.emit('new_confession', confession);

  res.status(201).json({
    success: true,
    confession,
  });
});

/**
 * Like/unlike a confession
 * POST /api/confessions/:id/like
 */
export const likeConfession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { anonymousAuthorId } = req.body;

  if (!anonymousAuthorId) {
    throw new BadRequestError(
      'Anonymous author ID is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['anonymousAuthorId'] }
    );
  }

  const confession = await Confession.findById(id);
  if (!confession) {
    throw new NotFoundError('Confession not found', ErrorCode.CONFESSION_NOT_FOUND);
  }

  // Check if already liked
  const likeIndex = confession.likes.indexOf(anonymousAuthorId);

  let action: 'liked' | 'unliked';
  if (likeIndex > -1) {
    // Unlike
    confession.likes.splice(likeIndex, 1);
    action = 'unliked';
  } else {
    // Like
    confession.likes.push(anonymousAuthorId);
    action = 'liked';
  }

  await confession.save();

  // Emit socket event for real-time update
  io.emit('update_confession_likes', { confessionId: id, likesCount: confession.likes.length });

  res.json({
    success: true,
    action,
    confession,
  });
});

/**
 * Add thought to confession
 * POST /api/confessions/:id/thought
 */
export const addThought = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content, anonymousAuthorId } = req.body;

  if (!content || content.trim() === '') {
    throw new BadRequestError(
      'Thought content is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['content'] }
    );
  }

  if (!anonymousAuthorId) {
    throw new BadRequestError(
      'Anonymous author ID is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['anonymousAuthorId'] }
    );
  }

  const confession = await Confession.findById(id);
  if (!confession) {
    throw new NotFoundError('Confession not found', ErrorCode.CONFESSION_NOT_FOUND);
  }

  const thought = {
    anonymousAuthorId,
    content: content.trim(),
    createdAt: new Date(),
  };

  confession.thoughts.push(thought);
  await confession.save();

  // Emit socket event for real-time update
  io.emit('new_thought', { confessionId: id, thought });

  res.status(201).json({
    success: true,
    confession,
    thought,
  });
});
