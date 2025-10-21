import { Request, Response, NextFunction } from 'express';
import { ApiError, InternalServerError } from '../utils/ApiError';
import mongoose from 'mongoose';

/**
 * Centralized error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  logError(err, req);

  // Handle known ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    res.status(422).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: validationErrors,
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      errorCode: 'INVALID_ID',
      message: 'Invalid ID format',
      details: { field: err.path, value: err.value },
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      errorCode: 'DUPLICATE_KEY',
      message: `${field} already exists`,
      details: { field },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      errorCode: 'TOKEN_INVALID',
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      errorCode: 'TOKEN_EXPIRED',
      message: 'Token has expired',
    });
    return;
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        errorCode: 'FILE_TOO_LARGE',
        message: 'File size exceeds limit',
      });
      return;
    }
    if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        errorCode: 'INVALID_FILE_TYPE',
        message: 'Unexpected file field',
      });
      return;
    }
  }

  // Handle unknown errors (5xx)
  const internalError = new InternalServerError(
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  );

  res.status(internalError.statusCode).json({
    success: false,
    errorCode: internalError.errorCode,
    message: internalError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Log error details for monitoring and debugging
 */
const logError = (err: Error | ApiError, req: Request): void => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: sanitizeBody(req.body),
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    errorMessage: err.message,
    errorName: err.name,
    ...(err instanceof ApiError && {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      isOperational: err.isOperational,
    }),
  };

  // Log based on error severity
  if (err instanceof ApiError && err.isOperational) {
    // Operational errors (expected, like validation errors)
    console.warn('⚠️  Operational Error:', JSON.stringify(errorLog, null, 2));
  } else {
    // Programming or unknown errors
    console.error('❌ Unexpected Error:', JSON.stringify(errorLog, null, 2));
    console.error('Stack trace:', err.stack);
  }
};

/**
 * Sanitize request body to avoid logging sensitive data
 */
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * 404 Not Found handler
 * Should be added before the error handler middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    errorCode: 'ROUTE_NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: asyncHandler(async (req, res) => { ... })
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
