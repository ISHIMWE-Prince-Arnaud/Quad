import { endpoints } from '@/lib/api';
import type { ApiUploadResponse } from '@/types/api';

export class UploadService {
  // Upload profile image
  static async uploadProfileImage(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.profile(file);
    return response.data.data;
  }

  // Upload cover image
  static async uploadCoverImage(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.cover(file);
    return response.data.data;
  }

  // Upload post media
  static async uploadPostMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.post(file);
    return response.data.data;
  }

  // Upload story media
  static async uploadStoryMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.story(file);
    return response.data.data;
  }

  // Upload poll media
  static async uploadPollMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.poll(file);
    return response.data.data;
  }

  // Upload chat media
  static async uploadChatMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.chat(file);
    return response.data.data;
  }

  // Delete uploaded file
  static async deleteFile(url: string): Promise<{ success: boolean }> {
    const response = await endpoints.upload.delete(url);
    return response.data;
  }

  // Batch upload multiple files
  static async batchUpload(
    files: File[], 
    type: 'post' | 'story' | 'poll' | 'chat'
  ): Promise<{ succeeded: ApiUploadResponse[]; failed: File[] }> {
    const uploadFn = {
      post: this.uploadPostMedia,
      story: this.uploadStoryMedia,
      poll: this.uploadPollMedia,
      chat: this.uploadChatMedia
    }[type];

    const results = await Promise.allSettled(
      files.map(file => uploadFn(file))
    );

    const succeeded: ApiUploadResponse[] = [];
    const failed: File[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        failed.push(files[index]);
      }
    });

    return { succeeded, failed };
  }

  // Get optimal image dimensions for different upload types
  static getOptimalDimensions(type: 'profile' | 'cover' | 'post' | 'story'): { 
    width: number; 
    height: number; 
    aspectRatio: string 
  } {
    const dimensions = {
      profile: { width: 400, height: 400, aspectRatio: '1:1' },
      cover: { width: 1200, height: 400, aspectRatio: '3:1' },
      post: { width: 1080, height: 1080, aspectRatio: '1:1' },
      story: { width: 1080, height: 1920, aspectRatio: '9:16' }
    };

    return dimensions[type];
  }

  // Validate file before upload
  static validateFile(file: File, type: 'image' | 'video' | 'any' = 'any'): { 
    valid: boolean; 
    error?: string 
  } {
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      profileImage: 5 * 1024 * 1024, // 5MB
      coverImage: 10 * 1024 * 1024 // 10MB
    };

    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];

    // Check file type
    if (type === 'image' && !imageTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid image format. Please use JPEG, PNG, WebP, GIF, or HEIC.' 
      };
    }

    if (type === 'video' && !videoTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid video format. Please use MP4, MOV, AVI, MKV, or WebM.' 
      };
    }

    if (type === 'any' && ![...imageTypes, ...videoTypes].includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file format. Please use a supported image or video format.' 
      };
    }

    // Check file size
    const maxSize = type === 'video' ? maxSizes.video : maxSizes.image;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.` 
      };
    }

    return { valid: true };
  }
}
