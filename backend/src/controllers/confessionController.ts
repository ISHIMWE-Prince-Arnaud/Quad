import { Request, Response } from 'express';
import Confession from '../models/Confession';
import { generateAnonymousIdentity } from '../utils/generateAvatar';
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
 * Get all confessions
 * GET /api/confessions
 */
export const getConfessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const confessions = await Confession.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(confessions);
  } catch (error) {
    console.error('Get confessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new confession
 * POST /api/confessions
 */
export const createConfession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, anonymousAuthorId } = req.body;
    const file = req.file;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
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
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      confessionData.mediaUrl = uploadResult.secure_url;
      confessionData.mediaType = mediaType;
    }

    // Create confession
    const confession = new Confession(confessionData);
    await confession.save();

    // Emit socket event for real-time update
    io.emit('new_confession', confession);

    res.status(201).json(confession);
  } catch (error) {
    console.error('Create confession error:', error);
    res.status(500).json({ message: 'Server error creating confession' });
  }
};

/**
 * Like/unlike a confession
 * POST /api/confessions/:id/like
 */
export const likeConfession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { anonymousAuthorId } = req.body;

    if (!anonymousAuthorId) {
      res.status(400).json({ message: 'Anonymous author ID is required' });
      return;
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      res.status(404).json({ message: 'Confession not found' });
      return;
    }

    // Check if already liked
    const likeIndex = confession.likes.indexOf(anonymousAuthorId);

    if (likeIndex > -1) {
      // Unlike
      confession.likes.splice(likeIndex, 1);
    } else {
      // Like
      confession.likes.push(anonymousAuthorId);
    }

    await confession.save();

    // Emit socket event for real-time update
    io.emit('update_confession_likes', { confessionId: id, likesCount: confession.likes.length });

    res.json(confession);
  } catch (error) {
    console.error('Like confession error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add thought to confession
 * POST /api/confessions/:id/thought
 */
export const addThought = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, anonymousAuthorId } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Thought content is required' });
      return;
    }

    if (!anonymousAuthorId) {
      res.status(400).json({ message: 'Anonymous author ID is required' });
      return;
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      res.status(404).json({ message: 'Confession not found' });
      return;
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

    res.status(201).json({ confession, thought });
  } catch (error) {
    console.error('Add thought error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
