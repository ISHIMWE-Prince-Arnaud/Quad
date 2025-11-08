import { IUser } from "./user.types.js";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}

export {};
