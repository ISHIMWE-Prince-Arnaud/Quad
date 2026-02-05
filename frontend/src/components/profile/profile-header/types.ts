import type { ProfileTab } from "@/components/profile/ProfileTabs";

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
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  reactionsReceived?: number;
};

export type ProfileHeaderProps = {
  user: ProfileHeaderUser;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  tabCounts?: {
    posts: number;
    stories: number;
    polls: number;
    bookmarks: number;
  };
  onFollow?: () => void | Promise<void>;
  onUnfollow?: () => void | Promise<void>;
  onEditProfile?: () => void;
  onUserUpdate?: (updatedUser: Partial<ProfileHeaderUser>) => void;
};
