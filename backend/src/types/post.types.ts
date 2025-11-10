import type { IUser } from './user.types.js';
import type { AspectRatio } from '../config/cloudinary.config.js';

export interface IMedia {
  url: string;
  type: "image" | "video";
  aspectRatio?: AspectRatio; // 1:1 (square), 16:9 (landscape), 9:16 (portrait)
}

// Note: IReaction moved to reaction.types.ts (now in separate collection)

export interface IPost {
  id: string;
  author: IUser;
  text?: string;
  media: IMedia[];
  // Note: reactions are now stored in separate Reaction collection
  // Note: comments are now stored in separate Comment collection
  reactionsCount?: number;  // Cached count for performance
  commentsCount?: number;   // Cached count for performance
  createdAt?: Date;
  updatedAt?: Date;
}