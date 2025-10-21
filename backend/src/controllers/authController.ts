import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign({ userId: user._id }, jwtSecret, {
    expiresIn: "30d",
  });

  res.status(201).json({
    success: true,
    token,
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

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  });

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

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = jwt.sign({ userId: user._id }, jwtSecret, {
    expiresIn: "30d",
  });

  res.json({
    success: true,
    token,
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
