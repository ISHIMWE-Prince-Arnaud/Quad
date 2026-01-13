import { Router } from "express";
import {
  uploadPostMedia,
  uploadStoryMedia,
  uploadPollMedia,
  uploadChatMedia,
  uploadProfileImage,
  uploadCoverImage,
  deleteFile,
} from "../controllers/upload.controller.js";
import { uploadSingle } from "../middlewares/multer.middleware.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * -------------------------
 * UPLOAD POST MEDIA (Image or Video)
 * POST /api/upload/post
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 1GB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post("/post", requireApiAuth, uploadSingle, uploadPostMedia);

/**
 * -------------------------
 * UPLOAD STORY MEDIA (Image or Video)
 * POST /api/upload/story
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "9:16")
 * Max: 10MB images, 1GB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post("/story", requireApiAuth, uploadSingle, uploadStoryMedia);

/**
 * -------------------------
 * UPLOAD POLL MEDIA (Image or Video)
 * POST /api/upload/poll
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 1GB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post("/poll", requireApiAuth, uploadSingle, uploadPollMedia);

/**
 * -------------------------
 * UPLOAD CHAT MEDIA (Image or Video)
 * POST /api/upload/chat
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image or video file
 *   - aspectRatio: "1:1" | "16:9" | "9:16" (optional, default: "1:1")
 * Max: 10MB images, 1GB videos
 * Formats: JPEG, PNG, WebP, GIF, HEIC (images) | MP4, MOV, AVI, MKV, WebM (videos)
 * -------------------------
 */
router.post("/chat", requireApiAuth, uploadSingle, uploadChatMedia);

/**
 * -------------------------
 * UPLOAD PROFILE IMAGE (Image Only)
 * POST /api/upload/profile
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image file only (no videos)
 * Max: 10MB
 * Formats: JPEG, PNG, WebP, GIF, HEIC
 * Output: Always square (1:1 aspect ratio)
 * -------------------------
 */
router.post("/profile", requireApiAuth, uploadSingle, uploadProfileImage);

/**
 * -------------------------
 * UPLOAD COVER IMAGE (Image Only)
 * POST /api/upload/cover
 * Protected: User must be signed in
 * Body (multipart/form-data):
 *   - file: image file only (no videos)
 * Max: 10MB
 * Formats: JPEG, PNG, WebP, GIF, HEIC
 * Output: 3:1 aspect ratio (1200x400px)
 * -------------------------
 */
router.post("/cover", requireApiAuth, uploadSingle, uploadCoverImage);

/**
 * -------------------------
 * DELETE FILE
 * DELETE /api/upload
 * Protected: User must be signed in
 * Body: { url: "cloudinary_url" }
 * -------------------------
 */
router.delete("/", requireApiAuth, deleteFile);

export default router;
