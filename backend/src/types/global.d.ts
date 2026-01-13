declare global {
  interface IUser {
    clerkId: string;
    username: string;
    previousUsernames?: string[];
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    coverImage?: string;
    bio?: string;
    isVerified?: boolean;
    followersCount?: number;
    followingCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  namespace Express {
    interface Request {
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
