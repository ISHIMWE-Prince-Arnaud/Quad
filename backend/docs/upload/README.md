# 📁 **File Upload Documentation**

## 📋 **Overview**

Quad uses Cloudinary for media storage and processing, providing optimized image/video uploads, automatic compression, and CDN delivery. This document covers the complete file upload implementation.

---

## 🏗️ **Upload Architecture**

### **Upload Flow**

```
Frontend → Multer Middleware → Cloudinary API → CDN → Database URL Storage
```

### **Core Components**

- **Multer**: Handle multipart form data
- **Cloudinary**: Cloud storage and processing
- **Upload Middleware**: File validation and processing
- **URL Management**: Secure URL generation and tracking

---

## ⚙️ **Configuration**

### **Environment Variables**

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
MAX_FILES_PER_REQUEST=5
```

### **Cloudinary Setup** (`config/cloudinary.config.ts`)

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Upload presets for different content types
export const UPLOAD_PRESETS = {
  profile: {
    folder: "quad/profiles",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  posts: {
    folder: "quad/posts",
    transformation: [
      { width: 1080, height: 1080, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  stories: {
    folder: "quad/stories",
    transformation: [
      { width: 1080, height: 1920, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
  chat: {
    folder: "quad/chat",
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  },
};

export default cloudinary;
```

---

## 🛠️ **Middleware Implementation**

### **Multer Configuration** (`middlewares/multer.middleware.ts`)

```typescript
import multer from "multer";
import path from "path";

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."));
  }
};

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for Cloudinary
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    files: parseInt(process.env.MAX_FILES_PER_REQUEST || "5"),
  },
  fileFilter,
});

// Different upload configurations
export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 5);
export const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "videos", maxCount: 2 },
]);
```

### **Upload Validation Middleware** (`middlewares/upload.middleware.ts`)

```typescript
import type { Request, Response, NextFunction } from "express";

export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  // Additional validation logic
  const files = (req.files as Express.Multer.File[]) || [req.file];

  for (const file of files) {
    if (!file) continue;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} exceeds maximum size of 10MB`,
      });
    }

    // Validate file type
    if (!isValidFileType(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} has invalid type: ${file.mimetype}`,
      });
    }
  }

  next();
};

const isValidFileType = (mimetype: string): boolean => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];
  return validTypes.includes(mimetype);
};
```

---

## 📤 **Upload Utilities**

### **Cloudinary Upload Helper** (`utils/upload.util.ts`)

```typescript
import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  size: number;
  aspectRatio?: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: Record<string, unknown> = {}
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Automatically detect file type
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          const aspectRatio = calculateAspectRatio(result.width, result.height);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
            aspectRatio,
          });
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
};

export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  options: any = {}
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return {
        success: true,
        message: "File deleted successfully",
      };
    } else {
      return {
        success: false,
        message: `Deletion failed: ${result.result}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete file",
    };
  }
};

// Calculate aspect ratio
const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/);
    return matches?.[1] ?? null;
  } catch (error) {
    return null;
  }
};
```

---

## 📝 **Upload Controllers**

### **Post Media Upload** (`controllers/upload.controller.ts`)

```typescript
export const uploadPostMedia = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadResults = [];

    for (const file of files) {
      const isVideo = file.mimetype.startsWith("video/");
      const uploadOptions = {
        ...UPLOAD_PRESETS.posts,
        resource_type: isVideo ? "video" : "image",
      };

      const result = await uploadToCloudinary(file, uploadOptions);
      uploadResults.push(result);
    }

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: uploadResults,
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Post media upload error", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error: err.message,
    });
  }
};
```

### **Profile Image Upload**

```typescript
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No profile image uploaded",
      });
    }

    // Validate it's an image
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Profile image must be an image file",
      });
    }

    const result = await uploadToCloudinary(file, UPLOAD_PRESETS.profile);

    // Update user profile in database
    const { userId } = req.auth;
    await User.findOneAndUpdate(
      { clerkId: userId },
      { profileImage: result.url }
    );

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: result,
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
```

### **Chat Media Upload**

```typescript
export const uploadChatMedia = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { receiverId } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No media file uploaded",
      });
    }

    const isVideo = file.mimetype.startsWith("video/");
    const uploadOptions = {
      ...UPLOAD_PRESETS.chat,
      resource_type: isVideo ? "video" : "image",
    };

    const result = await uploadToCloudinary(file, uploadOptions);

    // Create chat message with media
    const { userId } = req.auth;
    const message = await ChatMessage.create({
      senderId: userId,
      receiverId,
      mediaUrl: result.url,
      messageType: "media",
    });

    // Emit via socket
    const io = getSocketIO();
    const chatRoom = getChatRoomId(userId, receiverId);
    io.to(chatRoom).emit("chat:message", message);

    return res.status(200).json({
      success: true,
      message: "Chat media uploaded successfully",
      data: {
        ...result,
        messageId: message._id,
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
```

---

## 🗂️ **File Management**

### **Delete File Controller**

```typescript
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    const { userId } = req.auth;

    // Verify user owns the file (implement your ownership logic)
    const canDelete = await verifyFileOwnership(userId, publicId);
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this file",
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (result.success) {
      // Remove from database references
      await removeFileReferences(publicId);

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

const verifyFileOwnership = async (
  userId: string,
  publicId: string
): Promise<boolean> => {
  // Check if user owns content containing this file
  const posts = await Post.find({
    userId,
    mediaUrls: { $regex: publicId },
  });

  const stories = await Story.find({
    userId,
    $or: [
      { coverImage: { $regex: publicId } },
      { mediaUrls: { $regex: publicId } },
    ],
  });

  return posts.length > 0 || stories.length > 0;
};

const removeFileReferences = async (publicId: string) => {
  // Remove from posts
  await Post.updateMany(
    { mediaUrls: { $regex: publicId } },
    { $pull: { mediaUrls: { $regex: publicId } } }
  );

  // Remove from stories
  await Story.updateMany(
    { mediaUrls: { $regex: publicId } },
    { $pull: { mediaUrls: { $regex: publicId } } }
  );

  // Update cover images
  await Story.updateMany(
    { coverImage: { $regex: publicId } },
    { $unset: { coverImage: 1 } }
  );
};
```

---

## 🔄 **Image Processing**

### **Dynamic Image Transformations**

```typescript
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string => {
  if (!originalUrl.includes("cloudinary.com")) {
    return originalUrl;
  }

  const transformations = [];

  if (options.width || options.height) {
    const crop = options.crop || "fill";
    transformations.push(`c_${crop}`);

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  if (transformations.length === 0) {
    return originalUrl;
  }

  const transformString = transformations.join(",");
  return originalUrl.replace("/upload/", `/upload/${transformString}/`);
};

// Generate responsive image URLs
export const generateResponsiveUrls = (originalUrl: string) => {
  return {
    thumbnail: getOptimizedImageUrl(originalUrl, {
      width: 150,
      height: 150,
      crop: "fill",
    }),
    small: getOptimizedImageUrl(originalUrl, { width: 400, quality: "auto" }),
    medium: getOptimizedImageUrl(originalUrl, { width: 800, quality: "auto" }),
    large: getOptimizedImageUrl(originalUrl, { width: 1200, quality: "auto" }),
    original: originalUrl,
  };
};
```

---

## 📱 **Frontend Integration**

### **React Upload Component Example**

```jsx
import { useState } from "react";

const FileUploadComponent = ({ onUploadComplete, uploadType = "posts" }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (files) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();

    // Add files to form data
    if (files.length === 1) {
      formData.append("file", files[0]);
    } else {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      const response = await fetch(`/api/upload/${uploadType}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadComplete(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="upload-component">
      <input
        type="file"
        multiple={uploadType !== "profile"}
        accept="image/*,video/*"
        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
        disabled={uploading}
      />

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>Uploading... {progress}%</span>
        </div>
      )}
    </div>
  );
};
```

### **Drag & Drop Upload**

```jsx
const DragDropUpload = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  return (
    <div
      className={`drop-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <p>Drag & drop files here or click to browse</p>
    </div>
  );
};
```

---

## 📊 **Upload Analytics**

### **Track Upload Metrics**

```typescript
export const trackUploadMetrics = async (
  userId: string,
  fileType: string,
  fileSize: number,
  uploadTime: number
) => {
  await UploadAnalytics.create({
    userId,
    fileType,
    fileSize,
    uploadTime,
    timestamp: new Date(),
  });
};

export const getUploadStats = async (userId: string) => {
  const stats = await UploadAnalytics.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalUploads: { $sum: 1 },
        totalSize: { $sum: "$fileSize" },
        avgUploadTime: { $avg: "$uploadTime" },
        fileTypes: { $push: "$fileType" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalUploads: 0,
      totalSize: 0,
      avgUploadTime: 0,
      fileTypes: [],
    }
  );
};
```

---

## 🛡️ **Security Measures**

### **File Security Validation**

```typescript
export const validateFileContent = async (
  file: Express.Multer.File
): Promise<boolean> => {
  // Check file signature/magic numbers
  const fileSignature = file.buffer.slice(0, 4);

  const validSignatures = {
    "image/jpeg": [0xff, 0xd8, 0xff],
    "image/png": [0x89, 0x50, 0x4e, 0x47],
    "image/gif": [0x47, 0x49, 0x46],
    "video/mp4": [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftypmp4
  };

  // Add more validation logic
  return true; // Simplified for example
};

export const scanForMalware = async (
  file: Express.Multer.File
): Promise<boolean> => {
  // Integrate with malware scanning service
  // For example: ClamAV, VirusTotal API
  return true; // Simplified for example
};
```

### **Access Control**

```typescript
export const checkUploadPermissions = (
  userId: string,
  uploadType: string
): boolean => {
  // Implement your permission logic
  const permissions = {
    posts: true,
    stories: true,
    profile: true,
    chat: true,
  };

  return permissions[uploadType] || false;
};
```

---

## 📝 **Best Practices**

### **Performance Optimization**

1. **Use appropriate transformations** for different use cases
2. **Implement lazy loading** for images
3. **Use WebP format** for better compression
4. **Cache transformed images** for repeated requests

### **Security Guidelines**

1. **Validate file types** both client and server-side
2. **Scan files for malware** before processing
3. **Limit file sizes** to prevent abuse
4. **Use signed URLs** for sensitive content
5. **Implement rate limiting** for upload endpoints

### **User Experience**

1. **Show upload progress** for large files
2. **Provide file previews** before upload
3. **Support drag & drop** functionality
4. **Handle upload errors** gracefully
5. **Optimize for mobile** uploads

---

This file upload system provides secure, scalable, and user-friendly media handling with Cloudinary's powerful features, ensuring optimal performance and excellent user experience across all devices.
