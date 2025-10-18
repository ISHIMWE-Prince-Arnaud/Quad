import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ChatMessage from '../models/ChatMessage';

/**
 * Interface for authenticated socket
 */
interface AuthSocket extends Socket {
  user?: any;
}

/**
 * Initialize Socket.IO handlers
 */
export const initializeSocketHandlers = (io: Server): void => {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwtSecret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket: AuthSocket) => {
    console.log(`✅ User connected: ${socket.user?.username} (${socket.id})`);

    // Join user to their own room
    socket.join(`user:${socket.user?._id}`);

    /**
     * Send chat message
     */
    socket.on('send_chat_message', async (data: { content: string; mediaUrl?: string; mediaType?: string }) => {
      try {
        const message = new ChatMessage({
          author: socket.user._id,
          content: data.content,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
        });

        await message.save();
        await message.populate('author', 'username profilePicture');

        // Broadcast to all connected clients
        io.emit('new_chat_message', message);
      } catch (error) {
        console.error('Send chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Broadcast new post (called from REST API via server instance)
     */
    // This is handled directly in controllers by emitting through io instance

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user?.username} (${socket.id})`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO handlers initialized');
};

/**
 * Emit events from controllers
 * These functions are called from REST API controllers to broadcast real-time updates
 */

/**
 * Broadcast new post to all clients
 */
export const emitNewPost = (io: Server, post: any): void => {
  io.emit('new_post', post);
};

/**
 * Broadcast post like update
 */
export const emitUpdatePostLikes = (io: Server, postId: string, likes: any[]): void => {
  io.emit('update_post_likes', { postId, likes });
};

/**
 * Broadcast new comment
 */
export const emitNewComment = (io: Server, postId: string, comment: any): void => {
  io.emit('new_comment', { postId, comment });
};

/**
 * Broadcast poll vote update
 */
export const emitUpdatePollVotes = (io: Server, poll: any): void => {
  io.emit('update_poll_votes', poll);
};

/**
 * Broadcast new confession
 */
export const emitNewConfession = (io: Server, confession: any): void => {
  io.emit('new_confession', confession);
};

/**
 * Broadcast confession like update
 */
export const emitUpdateConfessionLikes = (io: Server, confessionId: string, likesCount: number): void => {
  io.emit('update_confession_likes', { confessionId, likesCount });
};

/**
 * Broadcast new thought
 */
export const emitNewThought = (io: Server, confessionId: string, thought: any): void => {
  io.emit('new_thought', { confessionId, thought });
};
