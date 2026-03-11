// src/routes/user.routes.ts
import { Router } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  checkUsername,
  checkEmail,
} from "../controllers/user.controller.js";

import {
  createUserSchema,
  updateUserProfileSchema,
  getUserSchema,
  deleteUserSchema,
} from "../schemas/user.schema.js";

import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clerkId
 *               - email
 *               - username
 *               - firstName
 *               - lastName
 *             properties:
 *               clerkId:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */
router.post(
  "/",
  authRateLimiter, // Rate limit user creation
  requireApiAuth, // API authentication using Clerk session
  validateSchema(createUserSchema), // Validate request body
  createUser, // Controller handles creation
);

/**
 * @swagger
 * /users/check/{username}:
 *   get:
 *     summary: Check if a username is available
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability status returned
 */
router.get("/check/:username", checkUsername);

/**
 * @swagger
 * /users/check-email/{email}:
 *   get:
 *     summary: Check if an email is available
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability status returned
 */
router.get("/check-email/:email", checkEmail);

/**
 * @swagger
 * /users/{clerkId}:
 *   get:
 *     summary: Get user profile by Clerk ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile data
 *       404:
 *         description: User not found
 */
router.get(
  "/:clerkId",
  requireApiAuth,
  validateSchema(getUserSchema, "params"),
  getUser,
);

/**
 * @swagger
 * /users/{clerkId}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated
 *       404:
 *         description: User not found
 */
router.put(
  "/:clerkId",
  requireApiAuth,
  validateSchema(updateUserProfileSchema),
  updateUser,
);

/**
 * @swagger
 * /users/{clerkId}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/:clerkId",
  requireApiAuth,
  validateSchema(deleteUserSchema, "params"),
  deleteUser,
);

export default router;
