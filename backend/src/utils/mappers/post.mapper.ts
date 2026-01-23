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
  static normalizeMedia(media: unknown): MediaItem[] {
    if (!Array.isArray(media)) return [];

    return media
      .map((item): MediaItem | null => {
        if (typeof item !== "object" || item === null) return null;
        const i = item as Record<string, unknown>;

        const url = typeof i.url === "string" ? i.url : undefined;
        const type = i.type === "image" || i.type === "video" ? i.type : undefined;

        if (!url || !type) return null;

        const aspectRatio =
          i.aspectRatio === "1:1" ||
          i.aspectRatio === "16:9" ||
          i.aspectRatio === "9:16"
            ? i.aspectRatio
            : undefined;

        return {
          url,
          type,
          ...(aspectRatio ? { aspectRatio } : {}),
        };
      })
      .filter((x): x is MediaItem => x !== null);
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
