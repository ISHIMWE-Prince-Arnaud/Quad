/**
 * Image compression utility
 * Compresses images before upload to reduce file size and improve performance
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: string;
}

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    mimeType = "image/jpeg",
  } = options;

  // Skip compression for small files (< 200KB)
  if (file.size < 200 * 1024) {
    return file;
  }

  // Skip compression for GIFs (to preserve animation)
  if (file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              // Only use compressed version if it's actually smaller
              if (compressedFile.size < file.size) {
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            mimeType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get optimal compression settings based on upload type
 */
export function getCompressionSettings(
  type: "profile" | "cover" | "post" | "story" | "chat"
): CompressionOptions {
  const settings: Record<string, CompressionOptions> = {
    profile: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.9,
    },
    cover: {
      maxWidth: 1920,
      maxHeight: 640,
      quality: 0.85,
    },
    post: {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.85,
    },
    story: {
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.85,
    },
    chat: {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
    },
  };

  return settings[type] || settings.post;
}
