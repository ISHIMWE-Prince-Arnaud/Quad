import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Poll from '../models/Poll';
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
        folder: 'quad/polls',
        timeout: 120000, // 2 minutes timeout
        chunk_size: 6000000, // 6MB chunks
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Poll media uploaded:', result?.secure_url);
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
    
    readableStream.on('error', (err) => {
      console.error('❌ Stream error:', err);
      reject(err);
    });
  });
};

/**
 * Get all polls with pagination
 * GET /api/polls?page=1&limit=20&type=regular
 */
export const getPolls = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { type } = req.query;
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

  let filter: any = {};
  if (type === 'would-you-rather') {
    filter.isWouldYouRather = true;
  } else if (type === 'regular') {
    filter.isWouldYouRather = false;
  }

  // Get total count for pagination metadata
  const totalPolls = await Poll.countDocuments(filter);
  const totalPages = Math.ceil(totalPolls / limit);

  // Fetch paginated polls
  const polls = await Poll.find(filter)
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    polls,
    pagination: {
      currentPage: page,
      totalPages,
      totalPolls,
      pollsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/**
 * Create a new poll
 * POST /api/polls
 */
export const createPoll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { question, options, isWouldYouRather } = req.body;
  const file = req.file;

  if (!question || !options) {
    throw new BadRequestError(
      'Question and options are required',
      ErrorCode.MISSING_FIELDS,
      { required: ['question', 'options'] }
    );
  }

  // Parse options if it's a string
  let parsedOptions;
  try {
    parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
  } catch (error) {
    throw new BadRequestError(
      'Invalid options format',
      ErrorCode.INVALID_INPUT,
      { field: 'options' }
    );
  }

  // Validate options
  if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) {
    throw new BadRequestError(
      'At least 2 options are required',
      ErrorCode.VALIDATION_ERROR,
      { minOptions: 2, provided: parsedOptions?.length || 0 }
    );
  }

  // Prepare poll data
  const pollData: any = {
    author: req.user._id,
    question,
    options: parsedOptions.map((opt: string) => ({ text: opt, votes: [] })),
    isWouldYouRather: isWouldYouRather === 'true' || isWouldYouRather === true,
  };

  // Upload media if provided
  if (file) {
    try {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      pollData.mediaUrl = uploadResult.secure_url;
      pollData.mediaType = mediaType;
    } catch (error: any) {
      throw new InternalServerError(
        'Failed to upload media',
        ErrorCode.CLOUDINARY_ERROR,
        { cloudinaryError: error.message }
      );
    }
  }

  // Create poll
  const poll = new Poll(pollData);
  await poll.save();
  await poll.populate('author', 'username profilePicture');

  // Emit socket event for real-time update
  io.emit('new_poll', poll);

  res.status(201).json({
    success: true,
    poll,
  });
});

/**
 * Vote on a poll
 * POST /api/polls/:id/vote
 */
export const votePoll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  const userId = req.user._id;

  if (optionIndex === undefined || optionIndex === null) {
    throw new BadRequestError(
      'Option index is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['optionIndex'] }
    );
  }

  const poll = await Poll.findById(id);
  if (!poll) {
    throw new NotFoundError('Poll not found', ErrorCode.POLL_NOT_FOUND);
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    throw new BadRequestError(
      'Invalid option index',
      ErrorCode.INVALID_INPUT,
      { optionIndex, maxIndex: poll.options.length - 1 }
    );
  }

  // Check if user already voted
  let hasVoted = false;
  poll.options.forEach((option, index) => {
    const voteIndex = option.votes.findIndex(vote => vote.toString() === userId.toString());
    if (voteIndex > -1) {
      hasVoted = true;
      // Remove previous vote
      option.votes.splice(voteIndex, 1);
    }
  });

  // Add new vote
  poll.options[optionIndex].votes.push(userId);

  await poll.save();
  await poll.populate('author', 'username profilePicture');

  // Emit socket event for real-time update
  io.emit('update_poll_votes', poll);

  res.json({
    success: true,
    action: hasVoted ? 'vote_changed' : 'voted',
    poll,
  });
});
