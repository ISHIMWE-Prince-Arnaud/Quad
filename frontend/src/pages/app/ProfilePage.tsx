import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { PostCard } from "@/components/posts/PostCard";
import { StoryCard } from "@/components/stories/StoryCard";
import { Button } from "@/components/ui/button";
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
    reactionsReceived: profile.stats?.reactionsReceived,
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
        title={
          controller.isNotFound ? "Profile Not Found" : "Something Went Wrong"
        }
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
              activeTab={controller.activeTab}
              onTabChange={controller.setActiveTab}
              tabCounts={{
                posts: controller.user?.postsCount ?? 0,
                stories: controller.user?.storiesCount ?? 0,
                polls: controller.user?.pollsCount ?? 0,
                bookmarks: controller.bookmarksCount,
              }}
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
            isOwnProfile={controller.isOwnProfile}
          />

          {/* Profile Content */}
          {controller.activeTab === "posts" ? (
            <div className="px-4 py-8 space-y-6">
              {controller.postsError && (
                <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                  {controller.postsError}
                </div>
              )}

              {!controller.postsError && controller.postsLoading && (
                <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                  Loading posts...
                </div>
              )}

              {!controller.postsError &&
                !controller.postsLoading &&
                controller.posts.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                    No posts yet.
                  </div>
                )}

              {controller.posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={
                    controller.isOwnProfile
                      ? controller.handleDeletePost
                      : undefined
                  }
                />
              ))}

              {controller.postsHasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void controller.handleLoadMorePosts()}
                    disabled={controller.postsLoading}>
                    {controller.postsLoading ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          ) : controller.activeTab === "stories" ? (
            <div className="px-4 py-8 space-y-6">
              {controller.storiesError && (
                <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                  {controller.storiesError}
                </div>
              )}

              {!controller.storiesError && controller.storiesLoading && (
                <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                  Loading stories...
                </div>
              )}

              {!controller.storiesError &&
                !controller.storiesLoading &&
                controller.stories.length === 0 && (
                  <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                    No stories yet.
                  </div>
                )}

              <div className="grid gap-6 md:grid-cols-2 items-start">
                {controller.stories.map((story) => (
                  <StoryCard
                    key={story._id}
                    story={story}
                    onDelete={
                      controller.isOwnProfile
                        ? controller.handleDeleteStory
                        : undefined
                    }
                    variant="grid"
                  />
                ))}
              </div>

              {controller.storiesHasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void controller.handleLoadMoreStories()}
                    disabled={controller.storiesLoading}>
                    {controller.storiesLoading ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-8">
              <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                Profile tab content will be rebuilt from scratch.
              </div>
            </div>
          )}
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
