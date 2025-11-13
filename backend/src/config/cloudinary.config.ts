import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.config.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS URLs
});

// Cloudinary folders for organization
export const CLOUDINARY_FOLDERS = {
  POSTS: "quad/posts",
  STORIES: "quad/stories",
  POLLS: "quad/polls",
  PROFILES: "quad/profiles",
  CHAT: "quad/chat",
  COVERS: "quad/covers",
} as const;

// Aspect ratio types
export type AspectRatio = "1:1" | "16:9" | "9:16";

// Aspect ratio configurations
export const ASPECT_RATIOS = {
  "1:1": {
    name: "Square",
    dimensions: { width: 1080, height: 1080 },
    description: "Instagram-style square format",
  },
  "16:9": {
    name: "Landscape",
    dimensions: { width: 1920, height: 1080 },
    description: "Widescreen landscape format",
  },
  "9:16": {
    name: "Portrait",
    dimensions: { width: 1080, height: 1920 },
    description: "Vertical portrait format (Stories)",
  },
} as const;

// Upload options presets
export const UPLOAD_PRESETS = {
  // Posts: Images and videos with any of the 3 aspect ratios
  POST_IMAGE: {
    folder: CLOUDINARY_FOLDERS.POSTS,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  POST_VIDEO: {
    folder: CLOUDINARY_FOLDERS.POSTS,
    resource_type: "video" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  // Stories: Images and videos with any of the 3 aspect ratios
  STORY_IMAGE: {
    folder: CLOUDINARY_FOLDERS.STORIES,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  STORY_VIDEO: {
    folder: CLOUDINARY_FOLDERS.STORIES,
    resource_type: "video" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  // Polls: Images and videos with any of the 3 aspect ratios
  POLL_IMAGE: {
    folder: CLOUDINARY_FOLDERS.POLLS,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  POLL_VIDEO: {
    folder: CLOUDINARY_FOLDERS.POLLS,
    resource_type: "video" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  // Profile: Images only (no videos)
  PROFILE: {
    folder: CLOUDINARY_FOLDERS.PROFILES,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1080, height: 1080, crop: "fill" }, // Square profile images
    ],
  },
  // Cover: Images only (no videos) for profile cover images
  COVER: {
    folder: CLOUDINARY_FOLDERS.COVERS,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1200, height: 400, crop: "fill" }, // 3:1 aspect ratio for covers
    ],
  },
  // Chat: Images and videos with any of the 3 aspect ratios
  CHAT_IMAGE: {
    folder: CLOUDINARY_FOLDERS.CHAT,
    resource_type: "image" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  CHAT_VIDEO: {
    folder: CLOUDINARY_FOLDERS.CHAT,
    resource_type: "video" as const,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  },
} as const;

// Helper to generate responsive image URLs based on aspect ratio
export const getResponsiveImageUrls = (publicId: string, aspectRatio: AspectRatio = "1:1") => {
  const config = ASPECT_RATIOS[aspectRatio];
  return {
    thumbnail: cloudinary.url(publicId, { 
      width: 150, 
      height: aspectRatio === "1:1" ? 150 : aspectRatio === "16:9" ? 84 : 267,
      crop: "fill" 
    }),
    small: cloudinary.url(publicId, { 
      width: 400, 
      crop: "limit" 
    }),
    medium: cloudinary.url(publicId, { 
      width: 800, 
      crop: "limit" 
    }),
    large: cloudinary.url(publicId, { 
      width: config.dimensions.width, 
      height: config.dimensions.height, 
      crop: "limit" 
    }),
    original: cloudinary.url(publicId, { quality: "auto", fetch_format: "auto" }),
  };
};

// Helper to generate video thumbnail
export const getVideoThumbnail = (publicId: string, aspectRatio: AspectRatio = "16:9") => {
  const thumbDimensions = {
    "1:1": { width: 400, height: 400 },
    "16:9": { width: 400, height: 225 },
    "9:16": { width: 225, height: 400 },
  };
  
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      { ...thumbDimensions[aspectRatio], crop: "fill" },
      { start_offset: "1" }, // Get frame at 1 second
    ],
    format: "jpg",
  });
};

// Helper to apply aspect ratio transformation
export const getAspectRatioTransformation = (aspectRatio: AspectRatio) => {
  const config = ASPECT_RATIOS[aspectRatio];
  return {
    width: config.dimensions.width,
    height: config.dimensions.height,
    crop: "limit" as const,
  };
};

export default cloudinary;
