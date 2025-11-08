import type { IUser } from "./user.types.js";

export interface IStory {
  id: string;
  author: IUser;
  content: string; // Could be rich text or HTML string from editor
  coverImage?: string;
  reactions?: { userId: IUser["id"]; type: string }[];
  commentsCount?: number;
  createdAt?: Date;
  expiresAt?: Date; // 24h expiration
}