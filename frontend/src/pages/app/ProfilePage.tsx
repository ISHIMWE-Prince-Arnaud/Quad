import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  ProfileTabs,
  TabContent,
  type ProfileTab,
} from "@/components/profile/ProfileTabs";
import {
  ProfileContentGrid,
  type ContentItem,
} from "@/components/profile/ProfileContentGrid";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/layout/ErrorFallback";
import { useAuthStore } from "@/stores/authStore";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { ProfileService } from "@/services/profileService";
import { FollowService } from "@/services/followService";
import type { ApiProfile } from "@/types/api";

// Convert ApiProfile to the format expected by ProfileHeader
const convertApiProfileToUser = (profile: ApiProfile) => {
  const joinedAt =
    profile.joinedAt ??
    profile.createdAt ??
    profile.updatedAt ??
    new Date().toISOString();

  return {
    _id: profile._id,
    clerkId: profile.clerkId,
    username: profile.username,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImage: profile.profileImage,
    coverImage: profile.coverImage,
    bio: profile.bio,
    joinedAt,
    isVerified: profile.isVerified,
    followers: profile.followers,
    following: profile.following,
    postsCount: profile.postsCount,
  };
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [user, setUser] = useState<ApiProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

  // Filter content based on active tab
  const filteredContent = content.filter((item) => {
    switch (activeTab) {
      case "posts":
        return item.type === "post";
      case "stories":
        return item.type === "story";
      case "polls":
        return item.type === "poll";
      case "saved":
        // TODO: Filter saved content when implemented
        return false;
      case "liked":
        // TODO: Filter liked content when implemented
        return false;
      default:
        return false;
    }
  });

  // Load user's content based on active tab
  const loadUserContent = useCallback(async () => {
    if (!username) return;

    try {
      let result;
      switch (activeTab) {
        case "posts":
          result = await ProfileService.getUserContent(username, "posts");
          break;
        case "stories":
          result = await ProfileService.getUserContent(username, "stories");
          break;
        case "polls":
          result = await ProfileService.getUserContent(username, "polls");
          break;
        case "saved":
        case "liked":
          // TODO: Implement saved and liked content
          setContent([]);
          return;
        default:
          setContent([]);
          return;
      }
      // Convert API content to expected format
      const convertedItems = result.items.map((item) => ({
        ...item,
        updatedAt: item.createdAt, // Use createdAt as updatedAt if missing
      })) as ContentItem[];
      setContent(convertedItems);
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
      setContent([]);
    }
  }, [username, activeTab]);

  // Get content counts
  const postCount = content.filter((item) => item.type === "post").length;
  const storyCount = content.filter((item) => item.type === "story").length;
  const pollCount = content.filter((item) => item.type === "poll").length;

  // Real API calls to fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username || authLoading) return;

      setLoading(true);
      setError(null);

      try {
        const profileData = await ProfileService.getProfileByUsername(username);
        setUser(profileData);

        // Only check follow status when viewing another user's profile
        if (!isOwnProfile) {
          const followStatus = await FollowService.checkFollowing(
            profileData.clerkId
          );
          setIsFollowing(followStatus.isFollowing);
        }

        // Load user's content based on active tab
        await loadUserContent();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username && !authLoading) {
      fetchProfileData();
    }
  }, [username, isOwnProfile, loadUserContent, authLoading]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!user) return;

    try {
      await FollowService.followUser(user.clerkId);
      setIsFollowing(true);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers: (prev.followers || 0) + 1,
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to follow user:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;

    try {
      await FollowService.unfollowUser(user.clerkId);
      setIsFollowing(false);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              followers: Math.max((prev.followers || 0) - 1, 0),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page
    console.log("Edit profile clicked");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback
        title="Profile Not Found"
        description={error}
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary componentName="ProfilePage">
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="px-4 py-6">
            <ProfileHeader
              user={convertApiProfileToUser(user)}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onEditProfile={handleEditProfile}
              onUserUpdate={(updatedUser) => {
                setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
              }}
            />
          </div>

          {/* Profile Navigation Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            postCount={postCount}
            storyCount={storyCount}
            pollCount={pollCount}
            isOwnProfile={isOwnProfile}
          />

          {/* Profile Content */}
          <TabContent>
            <ProfileContentGrid
              items={filteredContent}
              loading={loading}
              hasMore={false} // TODO: Implement pagination
              onLoadMore={() => {
                // TODO: Load more content
                console.log("Load more content");
              }}
            />
          </TabContent>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
