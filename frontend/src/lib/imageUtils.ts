// Image upload and processing utilities

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImage {
  file: File;
  url: string;
  dimensions: ImageDimensions;
  size: number;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Resize and compress image
 */
export function processImage(
  file: File, 
  options: ImageUploadOptions = {}
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width: originalWidth, height: originalHeight } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      const { width, height } = calculateDimensions(
        originalWidth,
        originalHeight,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image'));
            return;
          }

          const processedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });

          resolve({
            file: processedFile,
            url: URL.createObjectURL(processedFile),
            dimensions: { width, height },
            size: processedFile.size
          });
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  let width = originalWidth;
  let height = originalHeight;

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  // Only scale down, never up
  if (ratio < 1) {
    width = Math.round(originalWidth * ratio);
    height = Math.round(originalHeight * ratio);
  }

  return { width, height };
}

/**
 * Create object URL for preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Cleanup object URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Profile image processing (square, 400x400)
 */
export function processProfileImage(file: File): Promise<ProcessedImage> {
  return processImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    format: 'jpeg'
  });
}

/**
 * Cover image processing (1200x400 aspect ratio)
 */
export function processCoverImage(file: File): Promise<ProcessedImage> {
  return processImage(file, {
    maxWidth: 1200,
    maxHeight: 400,
    quality: 0.8,
    format: 'jpeg'
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
