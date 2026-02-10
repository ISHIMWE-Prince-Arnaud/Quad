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
  } catch (error: unknown) {
    logger.error("Post media upload error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error: message,
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
  } catch (error: unknown) {
    logger.error("Story upload error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to upload story",
      error: message,
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

    if (mimetype.startsWith("video/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed for polls",
      });
    }

    const preset = "POLL_IMAGE";
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
  } catch (error: unknown) {
    logger.error("Poll upload error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to upload poll media",
      error: message,
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
          { new: true },
        );

        // Optionally sync to Clerk as well so avatars stay consistent
        await clerkClient.users.updateUser(clerkId, {
          imageUrl: result.url,
        } as unknown as Parameters<typeof clerkClient.users.updateUser>[1]);
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
  } catch (error: unknown) {
    logger.error("Profile image upload error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: message,
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
          { new: true },
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
  } catch (error: unknown) {
    logger.error("Cover image upload error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to upload cover image",
      error: message,
    });
  }
};

// =========================
// DELETE FILE
// =========================
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    // Ownership check: verify the authenticated user owns this file
    const ownsFile = await verifyFileOwnership(userId, url);
    if (!ownsFile) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this file",
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
  } catch (error: unknown) {
    logger.error("File deletion error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: message,
    });
  }
};

/**
 * Check if the user owns the file at the given URL.
 * Searches across Post media, Story media, Poll media, and User profile/cover images.
 */
async function verifyFileOwnership(
  userId: string,
  url: string,
): Promise<boolean> {
  const { Post } = await import("../models/Post.model.js");
  const { Story } = await import("../models/Story.model.js");
  const { Poll } = await import("../models/Poll.model.js");
  const { User } = await import("../models/User.model.js");

  // Check user profile/cover images
  const user = await User.findOne({
    clerkId: userId,
    $or: [{ profileImage: url }, { coverImage: url }],
  });
  if (user) return true;

  // Check posts
  const post = await Post.findOne({
    "author.clerkId": userId,
    "media.url": url,
  });
  if (post) return true;

  // Check stories
  const story = await Story.findOne({
    "author.clerkId": userId,
    $or: [{ coverImage: url }, { content: { $regex: url } }],
  });
  if (story) return true;

  // Check polls
  const poll = await Poll.findOne({
    "author.clerkId": userId,
    "questionMedia.url": url,
  });
  if (poll) return true;

  return false;
}
