export interface IUser {
  clerkId: string; // Clerk user ID
  username: string; // Unique username
  email: string; // Email address
  displayName?: string; // Display name (legacy field)
  firstName?: string; // User first name
  lastName?: string; // User last name
  profileImage?: string; // URL to avatar/profile picture
  coverImage?: string; // URL to cover image
  bio?: string; // User bio/description
  isVerified?: boolean; // Optional verification flag
  followersCount?: number; // Number of followers
  followingCount?: number; // Number of users following
  createdAt?: Date; // Optional creation timestamp
  updatedAt?: Date; // Optional update timestamp
}
