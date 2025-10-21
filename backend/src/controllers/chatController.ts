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
 * Get chat messages with pagination
 * GET /api/chat/messages?page=1&limit=50
 * Returns messages in chronological order (oldest first)
 */
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
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
  const totalMessages = await ChatMessage.countDocuments();
  const totalPages = Math.ceil(totalMessages / limit);
  
  // Fetch paginated messages (newest first, then reverse)
  const messages = await ChatMessage.find()
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Reverse to get chronological order (oldest first)
  res.json({
    success: true,
    messages: messages.reverse(),
    pagination: {
      currentPage: page,
      totalPages,
      totalMessages,
      messagesPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
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
