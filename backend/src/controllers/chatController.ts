import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import ChatMessage from '../models/ChatMessage';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
import {
  BadRequestError,
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
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 100;
  
  const messages = await ChatMessage.find()
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit);

  // Reverse to get chronological order (oldest first)
  res.json({
    success: true,
    count: messages.length,
    messages: messages.reverse(),
  });
});

/**
 * Send a chat message (handled via Socket.IO, but also available as REST endpoint)
 * POST /api/chat/messages
 */
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  const file = req.file;

  // Validate that either content or file is provided
  if ((!content || content.trim() === '') && !file) {
    throw new BadRequestError(
      'Message content or media is required',
      ErrorCode.MISSING_FIELDS,
      { required: ['content or media file'] }
    );
  }

  // Prepare message data
  const messageData: any = {
    author: req.user._id,
    content: content ? content.trim() : '',
  };

  // Upload media if provided
  if (file) {
    try {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const uploadResult = await uploadToCloudinary(file.buffer, mediaType);
      messageData.mediaUrl = uploadResult.secure_url;
      messageData.mediaType = mediaType;
    } catch (error: any) {
      throw new InternalServerError(
        'Failed to upload media',
        ErrorCode.CLOUDINARY_ERROR,
        { cloudinaryError: error.message }
      );
    }
  }

  // Create message
  const message = new ChatMessage(messageData);
  await message.save();
  await message.populate('author', 'username profilePicture');

  // Emit to all connected clients via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('new_chat_message', message);
  }

  res.status(201).json({
    success: true,
    message,
  });
});
