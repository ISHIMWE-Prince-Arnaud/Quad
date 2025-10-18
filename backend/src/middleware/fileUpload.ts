import multer from 'multer';
import path from 'path';

/**
 * Configure multer for file uploads
 * Store files in memory for direct upload to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File filter to only accept images and videos
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if file is image
  if (mimetype.startsWith('image/') && allowedImageTypes.test(extname.substring(1))) {
    cb(null, true);
  }
  // Check if file is video
  else if (mimetype.startsWith('video/') && allowedVideoTypes.test(extname.substring(1))) {
    cb(null, true);
  }
  else {
    cb(new Error('Only image and video files are allowed'));
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});
