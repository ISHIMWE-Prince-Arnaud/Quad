import type { Request, Response } from "express";
import type { AspectRatio } from "../config/cloudinary.config.js";
import { logger } from "../utils/logger.util.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  validateFileType,
  validateFileSize,
  getValidationRules,
} from "../utils/upload.util.js";
import { User } from "../models/User.model.js";
import { clerkClient } from "@clerk/express";

// =========================
// UPLOAD POST MEDIA (Image or Video)
// =========================
export const uploadPostMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    const { buffer, mimetype, size } = req.file;
    const aspectRatio = (req.body.aspectRatio as AspectRatio) || "1:1";

    // Validate aspect ratio
    if (!["1:1", "16:9", "9:16"].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        message: "Invalid aspect ratio. Must be 1:1, 16:9, or 9:16",
      });
    }

    // Determine if image or video
    const isVideo = mimetype.startsWith("video/");
    const preset = isVideo ? "POST_VIDEO" : "POST_IMAGE";
    const rules = getValidationRules(preset);

    // Validate file type
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images and videos are allowed",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, preset);

    return res.status(200).json({
      success: true,
      message: `${isVideo ? "Video" : "Image"} uploaded successfully`,
      data: {
        ...result,
        aspectRatio,
      },
    });
  } catch (error: any) {
    logger.error("Post media upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error: error.message,
    });
  }
};

// =========================
// UPLOAD STORY MEDIA (Image or Video)
// =========================
export const uploadStoryMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { buffer, mimetype, size } = req.file;
    const aspectRatio = (req.body.aspectRatio as AspectRatio) || "9:16";

    // Validate aspect ratio
    if (!["1:1", "16:9", "9:16"].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        message: "Invalid aspect ratio. Must be 1:1, 16:9, or 9:16",
      });
    }

    // Determine if image or video
    const isVideo = mimetype.startsWith("video/");
    const preset = isVideo ? "STORY_VIDEO" : "STORY_IMAGE";
    const rules = getValidationRules(preset);

    // Validate file type
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type for story",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, preset);

    return res.status(200).json({
      success: true,
      message: "Story media uploaded successfully",
      data: {
        ...result,
        aspectRatio,
      },
    });
  } catch (error: any) {
    logger.error("Story upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload story",
      error: error.message,
    });
  }
};

// =========================
// UPLOAD POLL MEDIA (Image or Video)
// =========================
export const uploadPollMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { buffer, mimetype, size } = req.file;
    const aspectRatio = (req.body.aspectRatio as AspectRatio) || "1:1";

    // Validate aspect ratio
    if (!["1:1", "16:9", "9:16"].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        message: "Invalid aspect ratio. Must be 1:1, 16:9, or 9:16",
      });
    }

    // Determine if image or video
    const isVideo = mimetype.startsWith("video/");
    const preset = isVideo ? "POLL_VIDEO" : "POLL_IMAGE";
    const rules = getValidationRules(preset);

    // Validate file type
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type for poll",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, preset);

    return res.status(200).json({
      success: true,
      message: "Poll media uploaded successfully",
      data: {
        ...result,
        aspectRatio,
      },
    });
  } catch (error: any) {
    logger.error("Poll upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload poll media",
      error: error.message,
    });
  }
};

// =========================
// UPLOAD PROFILE IMAGE (Image Only)
// =========================
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { buffer, mimetype, size } = req.file;
    const rules = getValidationRules("PROFILE");

    // Validate file type (images only)
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed for profiles",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, "PROFILE");

    // Persist new profile image URL to MongoDB for the current user
    const clerkId = req.auth?.userId;
    if (clerkId) {
      try {
        await User.findOneAndUpdate(
          { clerkId },
          { $set: { profileImage: result.url } },
          { new: true }
        );

        // Optionally sync to Clerk as well so avatars stay consistent
        await clerkClient.users.updateUser(clerkId, {
          imageUrl: result.url,
        } as any);
      } catch (persistError) {
        logger.error("Failed to persist profile image URL", persistError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        ...result,
        aspectRatio: "1:1", // Profile images are always square
      },
    });
  } catch (error: any) {
    logger.error("Profile image upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};

// =========================
// UPLOAD CHAT MEDIA (Image or Video)
// =========================
export const uploadChatMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { buffer, mimetype, size } = req.file;
    const aspectRatio = (req.body.aspectRatio as AspectRatio) || "1:1";

    // Validate aspect ratio
    if (!["1:1", "16:9", "9:16"].includes(aspectRatio)) {
      return res.status(400).json({
        success: false,
        message: "Invalid aspect ratio. Must be 1:1, 16:9, or 9:16",
      });
    }

    // Determine if image or video
    const isVideo = mimetype.startsWith("video/");
    const preset = isVideo ? "CHAT_VIDEO" : "CHAT_IMAGE";
    const rules = getValidationRules(preset);

    // Validate file type
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type for chat",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, preset);

    return res.status(200).json({
      success: true,
      message: "Chat media uploaded successfully",
      data: {
        ...result,
        aspectRatio,
      },
    });
  } catch (error: any) {
    logger.error("Chat media upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload chat media",
      error: error.message,
    });
  }
};

// =========================
// UPLOAD COVER IMAGE (Image Only)
// =========================
export const uploadCoverImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { buffer, mimetype, size } = req.file;
    const rules = getValidationRules("COVER");

    // Validate file type (images only)
    if (!validateFileType(mimetype, rules.allowedTypes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed for cover images",
      });
    }

    // Validate file size
    if (!validateFileSize(size, rules.maxSize)) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${rules.maxSize}MB`,
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, "COVER");

    // Persist new cover image URL to MongoDB for the current user
    const clerkId = req.auth?.userId;
    if (clerkId) {
      try {
        await User.findOneAndUpdate(
          { clerkId },
          { $set: { coverImage: result.url } },
          { new: true }
        );
      } catch (persistError) {
        logger.error("Failed to persist cover image URL", persistError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cover image uploaded successfully",
      data: {
        ...result,
        aspectRatio: "3:1", // Cover images are 3:1 aspect ratio
      },
    });
  } catch (error: any) {
    logger.error("Cover image upload error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload cover image",
      error: error.message,
    });
  }
};

// =========================
// DELETE FILE
// =========================
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Extract publicId from URL
    const publicId = extractPublicIdFromUrl(url);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary URL",
      });
    }

    // Determine resource type (image or video)
    const resourceType = url.includes("/video/") ? "video" : "image";

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId, resourceType);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error: any) {
    logger.error("File deletion error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
};
