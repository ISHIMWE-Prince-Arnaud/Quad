import type { IUser } from './user.types.js';

export interface IMedia {
  url: string;
  type: "image" | "video";
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