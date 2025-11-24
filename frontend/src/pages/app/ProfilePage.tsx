import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const {
    user: currentUser,
    isLoading: authLoading,
    setUser: setAuthUser,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [user, setUser] = useState<ApiProfile | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
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
      setIsNotFound(false);

      try {
        let profileData: ApiProfile | null = null;

        try {
          // Primary fetch by username (canonical route)
          profileData = await ProfileService.getProfileByUsername(username);
        } catch (err: unknown) {
          let status: number | undefined;

          if (
            typeof err === "object" &&
            err !== null &&
            "response" in err &&
            typeof (err as { response?: { status?: number } }).response
              ?.status === "number"
          ) {
            status = (err as { response?: { status?: number } }).response
              ?.status;
          }

          // Fallback: when viewing any profile and username lookup 404s,
          // retry by Clerk ID (getProfileById) before showing "Profile not found".
          if (status === 404 && currentUser?.clerkId) {
            // Retry by Clerk ID before giving up. This covers cases where the
            // username in the URL is stale (e.g., just changed) but the
            // logged-in user is still the same.
            profileData = await ProfileService.getProfileById(
              currentUser.clerkId
            );

            // If we successfully loaded a profile and its canonical username
            // differs from the URL, fix the URL to avoid future 404s.
            if (profileData?.username && profileData.username !== username) {
              navigate(`/app/profile/${profileData.username}`, {
                replace: true,
              });
            }
          } else {
            throw err;
          }
        }

        if (!profileData) {
          setIsNotFound(true);
          setError("This profile does not exist or is no longer available.");
          return;
        }

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
      } catch (err: unknown) {
        let status: number | undefined;

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { status?: number } }).response
            ?.status === "number"
        ) {
          status = (err as { response?: { status?: number } }).response?.status;
        }

        if (status === 404) {
          setIsNotFound(true);
          setError("This profile does not exist or is no longer available.");
        } else {
          setIsNotFound(false);
          setError(
            "Something went wrong while loading this profile. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    console.log("ProfilePage load", {
      urlUsername: username,
      storeUsername: currentUser?.username,
      clerkId: currentUser?.clerkId,
      isOwnProfile,
    });

    if (username && !authLoading) {
      fetchProfileData();
    }
  }, [
    username,
    loadUserContent,
    authLoading,
    currentUser?.clerkId,
    currentUser?.username,
    isOwnProfile,
    navigate,
  ]);

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
        title={isNotFound ? "Profile Not Found" : "Something Went Wrong"}
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
                setUser((prev) =>
                  prev ? ({ ...prev, ...updatedUser } as ApiProfile) : prev
                );

                // If this is the current user's profile and the username changed,
                // update auth store user and navigate to the new profile URL.
                if (
                  isOwnProfile &&
                  updatedUser.username &&
                  updatedUser.username !== username
                ) {
                  if (currentUser) {
                    setAuthUser({
                      ...currentUser,
                      username: updatedUser.username,
                      firstName: updatedUser.firstName ?? currentUser.firstName,
                      lastName: updatedUser.lastName ?? currentUser.lastName,
                      profileImage:
                        updatedUser.profileImage ?? currentUser.profileImage,
                      bio: updatedUser.bio ?? currentUser.bio,
                    });
                  }

                  navigate(`/app/profile/${updatedUser.username}`, {
                    replace: true,
                  });
                }
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
