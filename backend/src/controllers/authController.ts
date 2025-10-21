import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ErrorCode,
} from "../utils/ApiError";
import { asyncHandler } from "../middleware/errorHandler";
import { validatePassword } from "../utils/passwordValidator";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenUtils";

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    throw new BadRequestError(
      "Please provide all required fields",
      ErrorCode.MISSING_FIELDS,
      { required: ["username", "email", "password"] }
    );
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new BadRequestError(
      "Password does not meet security requirements",
      ErrorCode.VALIDATION_ERROR,
      { requirements: passwordValidation.requirements }
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const conflictField = existingUser.email === email ? "email" : "username";
    throw new ConflictError(
      `User with this ${conflictField} already exists`,
      ErrorCode.USER_EXISTS,
      { field: conflictField }
    );
  }

  // Hash password
  const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Generate tokens (15-minute access token, 7-day refresh token)
  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  // Store refresh token in database
  user.refreshTokens = [refreshToken];
  await user.save();

  res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    throw new BadRequestError(
      "Please provide username and password",
      ErrorCode.MISSING_FIELDS,
      { required: ["username", "password"] }
    );
  }

  // Find user by username or email (include refreshTokens for token management)
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  }).select('+refreshTokens');

  if (!user) {
    throw new UnauthorizedError(
      "Invalid credentials",
      ErrorCode.INVALID_CREDENTIALS
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid credentials",
      ErrorCode.INVALID_CREDENTIALS
    );
  }

  // Generate new tokens
  const accessToken = generateAccessToken(String(user._id));
  const refreshToken = generateRefreshToken(String(user._id));

  // Store refresh token (limit to 5 devices)
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(refreshToken);
  
  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  
  await user.save();

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND);
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError(
      "Refresh token is required",
      ErrorCode.MISSING_FIELDS,
      { required: ["refreshToken"] }
    );
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new UnauthorizedError(
      "Invalid or expired refresh token",
      ErrorCode.TOKEN_INVALID
    );
  }

  // Find user and check if refresh token exists
  const user = await User.findById(decoded.userId).select('+refreshTokens');
  if (!user) {
    throw new NotFoundError("User not found", ErrorCode.USER_NOT_FOUND);
  }

  // Verify refresh token is stored in database
  if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
    throw new UnauthorizedError(
      "Refresh token not found or has been revoked",
      ErrorCode.TOKEN_INVALID
    );
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(String(user._id));

  res.json({
    success: true,
    accessToken: newAccessToken,
  });
});
