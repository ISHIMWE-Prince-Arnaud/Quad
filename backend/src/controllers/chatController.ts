import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import ChatMessage from '../models/ChatMessage';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * Helper function to upload file to Cloudinary
 */
const uploadToCloudinary = (buffer: Buffer, resourceType: 'image' | 'video'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: 'quad/chat',
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
 * Get chat messages
 * GET /api/chat/messages
 */
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const messages = await ChatMessage.find()
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Reverse to get chronological order (oldest first)
    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send a chat message (handled via Socket.IO, but also available as REST endpoint)
 * POST /api/chat/messages
 */
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const file = req.file;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Message content is required' });
      return;
    }

    // Prepare message data
    const messageData: any = {
      author: req.user._id,
      content: content.trim(),
    };

    // Upload media if provided
    if (file) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      messageData.mediaUrl = uploadResult.secure_url;
      messageData.mediaType = mediaType;
    }

    // Create message
    const message = new ChatMessage(messageData);
    await message.save();
    await message.populate('author', 'username profilePicture');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
