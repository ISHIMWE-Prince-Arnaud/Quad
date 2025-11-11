import type { IUser } from "./user.types.js";

/**
 * Profile Statistics Interface
 */
export interface IProfileStats {
  postsCount: number;
  storiesCount: number;
  pollsCount: number;
  reactionsReceived: number;
  // Following/followers will be added when Follow system is implemented
  // followersCount: number;
  // followingCount: number;
}

/**
 * Complete User Profile with Statistics
 */
export interface IUserProfile extends IUser {
  stats: IProfileStats;
}

/**
 * Update Profile DTO
 */
export interface IUpdateProfile {
  displayName?: string;
  bio?: string;
  profileImage?: string;
}
