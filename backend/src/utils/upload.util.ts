import cloudinary, { UPLOAD_PRESETS } from "../config/cloudinary.config.js";
import { logger } from "./logger.util.js";
import { Readable } from "stream";

// Upload result interface
export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
  resourceType: "image" | "video";
  thumbnail?: string; // For videos
}

// Upload options type
type UploadPresetType = keyof typeof UPLOAD_PRESETS;

/**
 * Upload file buffer to Cloudinary
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  preset: UploadPresetType = "POST_IMAGE"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = UPLOAD_PRESETS[preset];

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: uploadOptions.folder,
        resource_type: uploadOptions.resource_type,
        transformation: uploadOptions.transformation,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        if (!result) {
          return reject(new Error("Upload failed: No result returned"));
        }

        const uploadResult: UploadResult = {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes,
          resourceType: result.resource_type as "image" | "video",
        };

        // Generate thumbnail for videos
        if (result.resource_type === "video") {
          uploadResult.thumbnail = cloudinary.url(result.public_id, {
            resource_type: "video",
            transformation: [
              { width: 400, height: 300, crop: "fill" },
              { start_offset: "1" },
            ],
            format: "jpg",
          });
        }

        resolve(uploadResult);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  fileBuffers: Buffer[],
  preset: UploadPresetType = "POST_IMAGE"
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = fileBuffers.map((buffer) =>
      uploadToCloudinary(buffer, preset)
    );
    return await Promise.all(uploadPromises);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Multiple upload failed: ${message}`);
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true, // Invalidate CDN cache
    });

    if (result.result === "ok" || result.result === "not found") {
      return {
        success: true,
        message: result.result === "ok" ? "File deleted successfully" : "File not found",
      };
    }

    return {
      success: false,
      message: `Deletion failed: ${result.result}`,
    };
  } catch (error: unknown) {
    logger.error("Cloudinary delete error", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
};

/**
 * Delete multiple files from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (
  publicIds: string[],
  resourceType: "image" | "video" = "image"
): Promise<{ success: boolean; deleted: string[]; failed: string[] }> => {
  const results = await Promise.allSettled(
    publicIds.map((id) => deleteFromCloudinary(id, resourceType))
  );

  const deleted: string[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    const publicId = publicIds[index];
    if (publicId) {
      if (result.status === "fulfilled" && result.value.success) {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    }
  });

  return {
    success: failed.length === 0,
    deleted,
    failed,
  };
};

/**
 * Extract publicId from Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{version}/{public_id}.{format}
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
    return matches?.[1] ?? null;
  } catch (error) {
    logger.error("Error extracting publicId", error);
    return null;
  }
};

/**
 * Validate file type
 */
export const validateFileType = (
  mimetype: string,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.some((type) => mimetype.includes(type));
};

/**
 * Validate file size
 */
export const validateFileSize = (size: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
};

/**
 * Get file validation rules
 */
export const getValidationRules = (preset: UploadPresetType) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/heic"];
  const videoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
  
  const rules = {
    POST_IMAGE: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    POST_VIDEO: {
      maxSize: 1024, // 1GB
      allowedTypes: videoTypes,
    },
    STORY_IMAGE: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    STORY_VIDEO: {
      maxSize: 1024, // 1GB
      allowedTypes: videoTypes,
    },
    POLL_IMAGE: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    POLL_VIDEO: {
      maxSize: 1024, // 1GB
      allowedTypes: videoTypes,
    },
    PROFILE: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    COVER: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    CHAT_IMAGE: {
      maxSize: 10, // 10MB
      allowedTypes: imageTypes,
    },
    CHAT_VIDEO: {
      maxSize: 1024, // 1GB
      allowedTypes: videoTypes,
    },
  };

  return rules[preset];
};
