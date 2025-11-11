import type { IUser } from "./user.types.js";

/**
 * Follow Interface
 */
export interface IFollow {
  id: string;
  userId: string;
  followingId: string;
  createdAt: Date;
}

/**
 * Follow with User Details
 */
export interface IFollowWithUser extends IFollow {
  user?: IUser; // The follower's details
  following?: IUser; // The user being followed
}

/**
 * Follow Stats Interface
 */
export interface IFollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean; // Is current user following this user
  isFollowedBy: boolean; // Is this user following current user
  isMutual: boolean; // Mutual follow relationship
}
