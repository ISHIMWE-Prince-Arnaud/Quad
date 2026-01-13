import multer from "multer";
import type { Request } from "express";

// Store files in memory as buffers
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed mime types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-matroska", // .mkv
    "video/webm",
  ];

  const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed: images (JPEG, PNG, WebP, GIF, HEIC) and videos (MP4, MOV, AVI, MKV, WebM)`
      )
    );
  }
};

// Multer config for single file upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB max
  },
}).single("file");

// Multer config for multiple files upload (max 10 files)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB per file
    files: 10, // Max 10 files
  },
}).array("files", 10);

// Image-only upload
export const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, PNG, WebP, GIF, HEIC)"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
}).single("image");

// Video-only upload
export const uploadVideo = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
    ];

    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed (MP4, MOV, AVI, MKV, WebM)"));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB for videos
  },
}).single("video");

// Multiple images upload
export const uploadImages = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 10, // Max 10 images
  },
}).array("images", 10);
