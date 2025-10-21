/**
 * Custom API Error class with error codes
 * Extends Error to provide structured error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      errorCode: this.errorCode,
      message: this.message,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

/**
 * Predefined error types for common scenarios
 */
export class BadRequestError extends ApiError {
  constructor(message: string, errorCode: string = 'BAD_REQUEST', details?: any) {
    super(400, message, errorCode, true, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', errorCode: string = 'UNAUTHORIZED', details?: any) {
    super(401, message, errorCode, true, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN', details?: any) {
    super(403, message, errorCode, true, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', errorCode: string = 'NOT_FOUND', details?: any) {
    super(404, message, errorCode, true, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', errorCode: string = 'CONFLICT', details?: any) {
    super(409, message, errorCode, true, details);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', errorCode: string = 'VALIDATION_ERROR', details?: any) {
    super(422, message, errorCode, true, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', errorCode: string = 'INTERNAL_ERROR', details?: any) {
    super(500, message, errorCode, false, details);
  }
}

/**
 * Error codes enum for consistency
 */
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NO_TOKEN = 'NO_TOKEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  POST_NOT_FOUND = 'POST_NOT_FOUND',
  POLL_NOT_FOUND = 'POLL_NOT_FOUND',
  CONFESSION_NOT_FOUND = 'CONFESSION_NOT_FOUND',

  // Conflicts
  CONFLICT = 'CONFLICT',
  USER_EXISTS = 'USER_EXISTS',
  ALREADY_VOTED = 'ALREADY_VOTED',

  // File Upload
  FILE_REQUIRED = 'FILE_REQUIRED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // External Services
  CLOUDINARY_ERROR = 'CLOUDINARY_ERROR',
}
