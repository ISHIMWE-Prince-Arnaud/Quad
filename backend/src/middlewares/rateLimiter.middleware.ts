/**
 * Rate limiting middleware to prevent abuse and DoS attacks
 */
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.util.js";

import { env } from "../config/env.config.js";

/**
 * General rate limiter for all API endpoints
 */
export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === "development" ? 1000000 : 100, // Higher limit in development
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Strict rate limiter for search endpoints
 */
export const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 search requests per windowMs
  message: {
    success: false,
    message: "Too many search requests, please slow down.",
    retryAfter: 15 * 60,
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Search rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many search requests, please slow down.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Upload rate limiter for file upload endpoints
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 upload requests per windowMs
  message: {
    success: false,
    message: "Too many upload requests, please wait before uploading again.",
    retryAfter: 15 * 60,
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many upload requests, please wait before uploading again.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Authentication rate limiter for auth-related endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    retryAfter: 15 * 60,
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later.",
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Strict rate limiter for write operations (create, update, delete)
 */
export const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 write operations per minute
  message: {
    success: false,
    message: "Too many write operations, please slow down.",
    retryAfter: 60,
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Write rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: "Too many write operations, please slow down.",
      retryAfter: 60,
    });
  },
});
