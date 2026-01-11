import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.util.js";
import { logger } from "../utils/logger.util.js";
import { errorTracker } from "../utils/errorTracking.util.js";
import { env } from "../config/env.config.js";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal server error";

  const userId = (req as any)?.auth?.userId;

  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode,
    userId,
  });

  if (!isAppError || statusCode >= 500) {
    errorTracker.captureException(err, {
      path: req.path,
      method: req.method,
      userId,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
