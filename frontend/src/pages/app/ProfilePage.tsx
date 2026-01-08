import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import {
  ProfileTabs,
  TabContent,
} from "@/components/profile/ProfileTabs";
import {
  ProfileContentGrid,
} from "@/components/profile/ProfileContentGrid";
import { ProfileSkeleton } from "@/components/ui/loading";
import { ErrorFallback } from "@/components/layout/ErrorFallback";
import { useAuthStore } from "@/stores/authStore";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import type { ApiProfile } from "@/types/api";

import { useProfilePageController } from "./profile/useProfilePageController";

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
    mutualFollows: profile.mutualFollows,
  };
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const {
    user: currentUser,
    isLoading: authLoading,
    setUser: setStoreUser,
  } = useAuthStore();

  const controller = useProfilePageController({
    username,
    navigate,
    currentUser,
    authLoading,
    setAuthUser: (next) => {
      if (!currentUser) return;
      setStoreUser({ ...currentUser, ...next });
    },
  });

  const profileHeaderUser = useMemo(() => {
    return controller.user ? convertApiProfileToUser(controller.user) : null;
  }, [controller.user]);

  if (controller.loading) {
    return <ProfileSkeleton />;
  }

  if (controller.error) {
    return (
      <ErrorFallback
        title={controller.isNotFound ? "Profile Not Found" : "Something Went Wrong"}
        description={controller.error}
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  if (!controller.user || !profileHeaderUser) {
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
              user={profileHeaderUser}
              isOwnProfile={controller.isOwnProfile}
              isFollowing={controller.isFollowing}
              onFollow={controller.handleFollow}
              onUnfollow={controller.handleUnfollow}
              onEditProfile={controller.handleEditProfile}
              onUserUpdate={controller.handleUserUpdate}
            />
          </div>

          {/* Profile Navigation Tabs */}
          <ProfileTabs
            activeTab={controller.activeTab}
            onTabChange={controller.setActiveTab}
            postCount={controller.postCount}
            storyCount={controller.storyCount}
            pollCount={controller.pollCount}
            isOwnProfile={controller.isOwnProfile}
          />

          {/* Profile Content */}
          <TabContent>
            <ProfileContentGrid
              items={controller.filteredContent}
              loading={controller.loading || controller.loadingMore}
              hasMore={controller.hasMore}
              onLoadMore={() => {
                void controller.handleLoadMore();
              }}
            />
          </TabContent>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
