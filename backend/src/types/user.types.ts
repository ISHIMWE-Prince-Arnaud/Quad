export interface IUser {
  clerkId: string;             // Clerk user ID
  username: string;            // Unique username
  email: string;               // Email address
  displayName?: string;        // Display name (can be different from username)
  profileImage?: string;       // URL to avatar/profile picture
  bio?: string;                // User bio/description
  followersCount?: number;     // Number of followers
  followingCount?: number;     // Number of users following
  createdAt?: Date;            // Optional creation timestamp
  updatedAt?: Date;            // Optional update timestamp
}