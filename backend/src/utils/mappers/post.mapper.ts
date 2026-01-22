import type { IPostDocument } from "../../models/Post.model.js";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  aspectRatio?: "1:1" | "16:9" | "9:16";
}

export class PostMapper {
  /**
   * Normalizes media items to ensure consistent structure
   */
  static normalizeMedia(media: any[]): MediaItem[] {
    if (!Array.isArray(media)) return [];
    
    return media.map((item) => ({
      url: item.url,
      type: item.type,
      ...(item.aspectRatio ? { aspectRatio: item.aspectRatio } : {}),
    }));
  }

  /**
   * Transforms a post document into a standardized response format
   */
  static toResponse(post: IPostDocument) {
    const postObj = post.toObject ? post.toObject() : post;
    
    return {
      id: postObj._id,
      text: postObj.text,
      media: this.normalizeMedia(postObj.media),
      author: postObj.author,
      reactionsCount: postObj.reactionsCount || 0,
      commentsCount: postObj.commentsCount || 0,
      createdAt: postObj.createdAt,
      updatedAt: postObj.updatedAt,
    };
  }
}
