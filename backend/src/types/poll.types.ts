import type { IUser } from "./user.types.js";
import type { IMedia } from "./post.types.js";

export interface IPollOption {
  id: string;
  text?: string;       // optional text
  emoji?: string;      // optional emoji
  media?: IMedia[];    // optional images or videos
  votes?: number;
}

export interface IPoll {
  id: string;
  author: IUser;
  question: string;
  options: IPollOption[];
  isAnonymous?: boolean;
  multipleChoice?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
