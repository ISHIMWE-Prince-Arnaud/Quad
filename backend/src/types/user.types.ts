export interface IUser {
  clerkId: string; // Clerk user ID
  username: string; // Unique username
  email: string; // Email address
  displayName?: string | undefined; // Display name (legacy field)
  firstName?: string | undefined; // User first name
  lastName?: string | undefined; // User last name
  profileImage?: string | undefined; // URL to avatar/profile picture
  coverImage?: string | undefined; // URL to cover image
  bio?: string | undefined; // User bio/description
  isVerified?: boolean | undefined; // Optional verification flag
  followersCount?: number | undefined; // Number of followers
  followingCount?: number | undefined; // Number of users following
  createdAt?: Date | undefined; // Optional creation timestamp
  updatedAt?: Date | undefined; // Optional update timestamp
}
