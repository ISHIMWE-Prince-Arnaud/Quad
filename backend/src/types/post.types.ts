import type { IUser } from './user.types.js';

export interface IMedia {
  url: string;
  type: "image" | "video";
}

export interface IReaction {
  userId: IUser["clerkId"];
  type: string; // e.g., "heart", "like", etc.
}

export interface IPost {
  id: string;
  author: IUser;
  text?: string;
  media: IMedia[];
  reactions?: IReaction[];
  commentsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}