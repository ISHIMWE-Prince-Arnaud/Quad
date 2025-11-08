export interface IUser {
  id: string;                  // Clerk user ID
  username: string;            // Display name or username
  email: string;               // Email address
  profileImage?: string;       // URL to avatar/profile picture
  bio?: string;                // Optional bio
  createdAt?: Date;            // Optional creation timestamp
  updatedAt?: Date;            // Optional update timestamp
}