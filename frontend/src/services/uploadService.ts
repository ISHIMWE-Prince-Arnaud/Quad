import { endpoints } from "@/lib/api";
import type { ApiUploadResponse } from "@/types/api";

type RawUploadResponse = {
  url?: string;
  secure_url?: string;
  publicId?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  size?: number;
};

export class UploadService {
  private static normalizeUploadResponse(raw: unknown): ApiUploadResponse {
    if (!raw || typeof raw !== "object") {
      throw new Error("Upload failed: Invalid response shape");
    }

    const data = raw as RawUploadResponse;
    const url = data.url || data.secure_url;
    if (!url) {
      throw new Error("Upload failed: Missing URL in response");
    }

    return {
      url,
      publicId: data.publicId || data.public_id || "",
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes ?? data.size,
    };
  }

  // Upload profile image
  static async uploadProfileImage(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.profile(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Upload cover image
  static async uploadCoverImage(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.cover(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Upload post media
  static async uploadPostMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.post(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Upload story media
  static async uploadStoryMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.story(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Upload poll media
  static async uploadPollMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.poll(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Upload chat media
  static async uploadChatMedia(file: File): Promise<ApiUploadResponse> {
    const response = await endpoints.upload.chat(file);
    const raw = response.data?.data ?? response.data;
    return this.normalizeUploadResponse(raw);
  }

  // Delete uploaded file
  static async deleteFile(url: string): Promise<{ success: boolean }> {
    const response = await endpoints.upload.delete(url);
    return response.data;
  }

  // Batch upload multiple files
  static async batchUpload(
    files: File[],
    type: "post" | "story" | "poll" | "chat"
  ): Promise<{ succeeded: ApiUploadResponse[]; failed: File[] }> {
    const uploadFn = {
      post: this.uploadPostMedia,
      story: this.uploadStoryMedia,
      poll: this.uploadPollMedia,
      chat: this.uploadChatMedia,
    }[type];

    const results = await Promise.allSettled(
      files.map((file) => uploadFn(file))
    );

    const succeeded: ApiUploadResponse[] = [];
    const failed: File[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeeded.push(result.value);
      } else {
        failed.push(files[index]);
      }
    });

    return { succeeded, failed };
  }

  // Get optimal image dimensions for different upload types
  static getOptimalDimensions(type: "profile" | "cover" | "post" | "story"): {
    width: number;
    height: number;
    aspectRatio: string;
  } {
    const dimensions = {
      profile: { width: 400, height: 400, aspectRatio: "1:1" },
      cover: { width: 1200, height: 400, aspectRatio: "3:1" },
      post: { width: 1080, height: 1080, aspectRatio: "1:1" },
      story: { width: 1080, height: 1920, aspectRatio: "9:16" },
    };

    return dimensions[type];
  }

  // Validate file before upload
  static validateFile(
    file: File,
    type: "image" | "video" | "any" = "any"
  ): {
    valid: boolean;
    error?: string;
  } {
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      profileImage: 5 * 1024 * 1024, // 5MB
      coverImage: 10 * 1024 * 1024, // 10MB
    };

    const imageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ];
    const videoTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
    ];

    // Check file type
    if (type === "image" && !imageTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          "Invalid image format. Please use JPEG, PNG, WebP, GIF, or HEIC.",
      };
    }

    if (type === "video" && !videoTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid video format. Please use MP4, MOV, AVI, MKV, or WebM.",
      };
    }

    if (type === "any" && ![...imageTypes, ...videoTypes].includes(file.type)) {
      return {
        valid: false,
        error:
          "Invalid file format. Please use a supported image or video format.",
      };
    }

    // Check file size
    const maxSize = type === "video" ? maxSizes.video : maxSizes.image;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size too large. Maximum size is ${Math.round(
          maxSize / 1024 / 1024
        )}MB.`,
      };
    }

    return { valid: true };
  }
}
