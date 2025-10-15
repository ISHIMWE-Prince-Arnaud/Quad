import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join user's personal room for private notifications
    socket.join(`user:${socket.userId}`);

    // Handle real-time events
    socket.on('post:create', (postData) => {
      // Broadcast to all connected clients except sender
      socket.broadcast.emit('post:new', postData);
    });

    socket.on('post:react', ({ postId, reaction, userId }) => {
      // Broadcast reaction to all clients viewing the post
      io.emit('post:reaction', { postId, reaction, userId });
    });

    socket.on('post:comment', ({ postId, comment }) => {
      // Broadcast new comment to all clients viewing the post
      io.emit('post:newComment', { postId, comment });
    });

    socket.on('poll:vote', ({ pollId, option, results }) => {
      // Broadcast updated poll results
      io.emit(`poll:${pollId}:update`, results);
    });

    socket.on('confession:create', (confession) => {
      // Broadcast new confession to all clients
      socket.broadcast.emit('confession:new', confession);
    });

    socket.on('user:typing', ({ postId }) => {
      // Broadcast typing status to others viewing the post
      socket.broadcast.to(`post:${postId}`).emit('user:typing', { userId: socket.userId });
    });

    // Join a post's room when viewing it
    socket.on('post:view', (postId) => {
      socket.join(`post:${postId}`);
    });

    // Leave a post's room when navigating away
    socket.on('post:leave', (postId) => {
      socket.leave(`post:${postId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};