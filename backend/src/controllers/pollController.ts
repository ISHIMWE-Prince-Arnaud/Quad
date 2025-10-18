import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Poll from '../models/Poll';
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
        folder: 'quad/polls',
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
 * Get all polls
 * GET /api/polls
 */
export const getPolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    
    let filter: any = {};
    if (type === 'would-you-rather') {
      filter.isWouldYouRather = true;
    } else if (type === 'regular') {
      filter.isWouldYouRather = false;
    }

    const polls = await Poll.find(filter)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new poll
 * POST /api/polls
 */
export const createPoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, options, isWouldYouRather } = req.body;
    const file = req.file;

    if (!question || !options) {
      res.status(400).json({ message: 'Question and options are required' });
      return;
    }

    // Parse options if it's a string
    let parsedOptions;
    try {
      parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
    } catch (error) {
      res.status(400).json({ message: 'Invalid options format' });
      return;
    }

    // Validate options
    if (!Array.isArray(parsedOptions) || parsedOptions.length < 2) {
      res.status(400).json({ message: 'At least 2 options are required' });
      return;
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
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      pollData.mediaUrl = uploadResult.secure_url;
      pollData.mediaType = mediaType;
    }

    // Create poll
    const poll = new Poll(pollData);
    await poll.save();
    await poll.populate('author', 'username profilePicture');

    // Emit socket event for real-time update
    io.emit('new_poll', poll);

    res.status(201).json(poll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Server error creating poll' });
  }
};

/**
 * Vote on a poll
 * POST /api/polls/:id/vote
 */
export const votePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    if (optionIndex === undefined || optionIndex === null) {
      res.status(400).json({ message: 'Option index is required' });
      return;
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      res.status(400).json({ message: 'Invalid option index' });
      return;
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

    res.json(poll);
  } catch (error) {
    console.error('Vote poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
