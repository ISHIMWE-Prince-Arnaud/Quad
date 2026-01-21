import type { IUser } from "./user.types.js";
import type { IMedia } from "./post.types.js";

/**
 * Chat Message Interface
 */
export interface IChatMessage {
  id: string;
  author: IUser;
  text?: string;
  media?: IMedia;
  mentions: string[]; // Array of mentioned usernames
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Typing Indicator Interface
 */
export interface ITypingIndicator {
  userId: string;
  username: string;
}

/**
 * Create Message DTO
 */
export interface ICreateMessage {
  text?: string;
  media?: IMedia;
}

/**
 * Update Message DTO
 */
export interface IUpdateMessage {
  text?: string;
  media?: IMedia | null; // null = remove media
}
