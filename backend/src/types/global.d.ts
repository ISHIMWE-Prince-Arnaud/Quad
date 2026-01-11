import { IUser } from "./user.types.js";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
      auth: {
        userId: string;
        sessionId: string;
        orgId?: string;
        orgRole?: string;
        orgSlug?: string;
      };
      requestId?: string;
    }
  }
}

export {};
