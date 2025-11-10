import { Router } from "express";
import {
  uploadPostMedia,
  uploadStoryMedia,
  uploadPollMedia,
  uploadChatMedia,
  uploadProfileImage,
  deleteFile,
} from "../controllers/upload.controller.js";
import { uploadSingle } from "../middlewares/multer.middleware.js";
import { requireAuth } from "@clerk/express";

const router = Router();

/**
 * -------------------------
 * UPLOAD POST MEDIA (Image or Video)
 * POST /api/upload/post
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 100MB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post(
  "/post",
  requireAuth(),
  uploadSingle,
  uploadPostMedia
);

/**
 * -------------------------
 * UPLOAD STORY MEDIA (Image or Video)
 * POST /api/upload/story
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "9:16")
 * Max: 10MB images, 100MB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post(
  "/story",
  requireAuth(),
  uploadSingle,
  uploadStoryMedia
);

/**
 * -------------------------
 * UPLOAD POLL MEDIA (Image or Video)
 * POST /api/upload/poll
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 100MB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post(
  "/poll",
  requireAuth(),
  uploadSingle,
  uploadPollMedia
);

/**
 * -------------------------
 * UPLOAD CHAT MEDIA (Image or Video)
 * POST /api/upload/chat
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 50MB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post(
  "/chat",
  requireAuth(),
  uploadSingle,
  uploadChatMedia
);

/**
 * -------------------------
 * UPLOAD PROFILE IMAGE (Image Only)
 * POST /api/upload/profile
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image file only (no videos)
 * Max: 5MB
 * Formats: JPEG, PNG, WebP, GIF, HEIC
 * Output: Always square (1:1 aspect ratio)
 * -------------------------
 */
router.post(
  "/profile",
  requireAuth(),
  uploadSingle,
  uploadProfileImage
);

/**
 * -------------------------
 * DELETE FILE
 * DELETE /api/upload
 * Protected: User must be signed in
 * Body: { url: "cloudinary_url" }
 * -------------------------
 */
router.delete(
  "/",
  requireAuth(),
  deleteFile
);

export default router;
