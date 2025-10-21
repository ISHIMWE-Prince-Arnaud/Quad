import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError, ErrorCode } from '../utils/ApiError';

/**
 * Extend Express Request to include user
 */
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(
        'No token provided, authorization denied',
        ErrorCode.NO_TOKEN
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new UnauthorizedError(
        'User not found, authorization denied',
        ErrorCode.USER_NOT_FOUND
      );
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Pass error to centralized error handler
    next(error);
  }
};
