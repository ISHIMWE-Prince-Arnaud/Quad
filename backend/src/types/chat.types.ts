import type { IUser } from "./user.types.js";
import type { IMedia } from "./post.types.js";

export interface IChatMessage {
  id: string;
  sender: IUser;
  text?: string;
  media?: IMedia;  // Single image or video with aspect ratio
  createdAt?: Date;
}
