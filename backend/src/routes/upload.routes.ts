import { Router } from "express";
import {
  uploadPostMedia,
  uploadStoryMedia,
  uploadPollMedia,
  uploadProfileImage,
  uploadCoverImage,
  deleteFile,
} from "../controllers/upload.controller.js";
import { uploadSingle } from "../middlewares/multer.middleware.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /upload/post:
 *   post:
 *     summary: Upload media for a post (Image or Video)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               aspectRatio:
 *                 type: string
 *                 enum: [1:1, 16:9, 9:16]
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post("/post", requireApiAuth, uploadSingle, uploadPostMedia);

/**
 * @swagger
 * /upload/story:
 *   post:
 *     summary: Upload media for a story (Image or Video)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               aspectRatio:
 *                 type: string
 *                 enum: [1:1, 16:9, 9:16]
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post("/story", requireApiAuth, uploadSingle, uploadStoryMedia);

/**
 * @swagger
 * /upload/poll:
 *   post:
 *     summary: Upload media for a poll (Image or Video)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               aspectRatio:
 *                 type: string
 *                 enum: [1:1, 16:9, 9:16]
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post("/poll", requireApiAuth, uploadSingle, uploadPollMedia);

/**
 * @swagger
 * /upload/profile:
 *   post:
 *     summary: Upload user profile image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 */
router.post("/profile", requireApiAuth, uploadSingle, uploadProfileImage);

/**
 * @swagger
 * /upload/cover:
 *   post:
 *     summary: Upload user cover image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover image uploaded successfully
 */
router.post("/cover", requireApiAuth, uploadSingle, uploadCoverImage);

/**
 * @swagger
 * /upload:
 *   delete:
 *     summary: Delete a file from Cloudinary storage
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
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: File deleted
 */
router.delete("/", requireApiAuth, deleteFile);

export default router;
