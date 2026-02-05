import type { IUser } from "./user.types.js";

/**
 * Profile Statistics Interface
 */
export interface IProfileStats {
  postsCount: number;
  storiesCount: number;
  pollsCount: number;
  reactionsReceived: number;
  followersCount: number;
  followingCount: number;
}

/**
 * Complete User Profile returned by the API (aligned with frontend ApiProfile)
 */
export interface IUserProfile extends IUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  coverImage?: string;
  isVerified?: boolean;
  joinedAt: Date;
  postsCount?: number;
  storiesCount?: number;
  pollsCount?: number;
  stats: IProfileStats;
}

/**
 * Update Profile DTO
 */
export interface IUpdateProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  displayName?: string;
}
