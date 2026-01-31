export type ProfileHeaderUser = {
  _id: string;
  clerkId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  joinedAt: string;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  postsCount?: number;
  reactionsReceived?: number;
  mutualFollows?: number;
};

export type ProfileHeaderProps = {
  user: ProfileHeaderUser;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onEditProfile?: () => void;
  onUserUpdate?: (updatedUser: Partial<ProfileHeaderUser>) => void;
};
