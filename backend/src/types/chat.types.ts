import type { IUser } from "./user.types.js";

export interface IChatMessage {
  id: string;
  sender: IUser;
  text?: string;
  mediaUrl?: string;
  createdAt?: Date;
}
