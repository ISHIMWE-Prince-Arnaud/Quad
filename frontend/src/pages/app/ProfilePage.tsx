import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bookmark, Images, SquarePen, BarChart3 } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { PostCard } from "@/components/posts/PostCard";
import { PollCard } from "@/components/polls/PollCard";
import { StoryCard } from "@/components/stories/StoryCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FeedSkeleton,
  ProfileBookmarksPollsTabSkeleton,
  ProfileBookmarksStoriesTabSkeleton,
  ProfileBookmarksTabSkeleton,
  ProfilePollsTabSkeleton,
  ProfileSkeleton,
  ProfileStoriesTabSkeleton,
  LoadMoreButton,
} from "@/components/ui/loading";
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
    followersCount: profile.followersCount,
    followingCount: profile.followingCount,
    postsCount: profile.postsCount,
    reactionsReceived: profile.stats?.reactionsReceived,
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
    return <ProfileSkeleton isOwnProfile={controller.isOwnProfile} />;
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

              {!controller.postsError &&
                controller.postsLoading &&
                controller.posts.length === 0 && <FeedSkeleton />}

              {!controller.postsError &&
                !controller.postsLoading &&
                controller.posts.length === 0 && (
                  <EmptyState
                    icon={<SquarePen className="h-7 w-7" />}
                    title="No posts yet"
                    description="When you publish posts, they’ll show up here."
                  />
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
                <LoadMoreButton
                  loading={controller.postsLoading}
                  onClick={() => void controller.handleLoadMorePosts()}
                />
              )}
            </div>
          ) : controller.activeTab === "stories" ? (
            controller.storiesLoading &&
            !controller.storiesError &&
            controller.stories.length === 0 ? (
              <ProfileStoriesTabSkeleton />
            ) : (
              <div className="px-4 py-8 space-y-6">
                {controller.storiesError && (
                  <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                    {controller.storiesError}
                  </div>
                )}

                {!controller.storiesError &&
                  !controller.storiesLoading &&
                  controller.stories.length === 0 && (
                    <EmptyState
                      icon={<Images className="h-7 w-7" />}
                      title="No stories yet"
                      description="Stories you create will appear here."
                    />
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
                  <LoadMoreButton
                    loading={controller.storiesLoading}
                    onClick={() => void controller.handleLoadMoreStories()}
                  />
                )}
              </div>
            )
          ) : controller.activeTab === "polls" ? (
            controller.pollsLoading &&
            !controller.pollsError &&
            controller.polls.length === 0 ? (
              <ProfilePollsTabSkeleton />
            ) : (
              <div className="px-4 py-8 space-y-6">
                {controller.pollsError && (
                  <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                    {controller.pollsError}
                  </div>
                )}

                {!controller.pollsError &&
                  !controller.pollsLoading &&
                  controller.polls.length === 0 && (
                    <EmptyState
                      icon={<BarChart3 className="h-7 w-7" />}
                      title="No polls yet"
                      description="Create a poll and it will show up here for people to vote on."
                    />
                  )}

                <div className="space-y-6">
                  {controller.polls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onUpdate={controller.handlePollUpdate}
                      onDelete={
                        controller.isOwnProfile
                          ? controller.handleDeletePoll
                          : undefined
                      }
                    />
                  ))}
                </div>

                {controller.pollsHasMore && (
                  <LoadMoreButton
                    loading={controller.pollsLoading}
                    onClick={() => void controller.handleLoadMorePolls()}
                  />
                )}
              </div>
            )
          ) : controller.activeTab === "saved" ? (
            !controller.isOwnProfile ? (
              <div className="px-4 py-8 space-y-6">
                <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                  Bookmarks are only visible on your own profile.
                </div>
              </div>
            ) : controller.savedTab === "posts" &&
              controller.savedPostsLoading &&
              !controller.savedPostsError &&
              controller.savedPosts.length === 0 ? (
              <ProfileBookmarksTabSkeleton />
            ) : controller.savedTab === "stories" &&
              controller.savedStoriesLoading &&
              !controller.savedStoriesError &&
              controller.savedStories.length === 0 ? (
              <ProfileBookmarksStoriesTabSkeleton />
            ) : controller.savedTab === "polls" &&
              controller.savedPollsLoading &&
              !controller.savedPollsError &&
              controller.savedPolls.length === 0 ? (
              <ProfileBookmarksPollsTabSkeleton />
            ) : (
              <div className="px-4 py-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={
                      controller.savedTab === "posts" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => controller.setSavedTab("posts")}
                    className="rounded-full">
                    Posts
                  </Button>

                  <Button
                    type="button"
                    variant={
                      controller.savedTab === "stories" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => controller.setSavedTab("stories")}
                    className="rounded-full">
                    Stories
                  </Button>

                  <Button
                    type="button"
                    variant={
                      controller.savedTab === "polls" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => controller.setSavedTab("polls")}
                    className="rounded-full">
                    Polls
                  </Button>
                </div>

                {controller.savedTab === "posts" ? (
                  <div className="space-y-6">
                    {controller.savedPostsError && (
                      <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                        {controller.savedPostsError}
                      </div>
                    )}

                    {!controller.savedPostsError &&
                      !controller.savedPostsLoading &&
                      controller.savedPosts.length === 0 && (
                        <EmptyState
                          icon={<Bookmark className="h-7 w-7" />}
                          title="No bookmarked posts"
                          description="Posts you bookmark will appear here for quick access."
                        />
                      )}

                    {controller.savedPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}

                    {controller.savedPostsHasMore && (
                      <LoadMoreButton
                        loading={controller.savedPostsLoading}
                        onClick={() =>
                          void controller.handleLoadMoreSavedPosts()
                        }
                      />
                    )}
                  </div>
                ) : null}

                {controller.savedTab === "stories" ? (
                  <div className="space-y-6">
                    {controller.savedStoriesError && (
                      <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                        {controller.savedStoriesError}
                      </div>
                    )}

                    {!controller.savedStoriesError &&
                      !controller.savedStoriesLoading &&
                      controller.savedStories.length === 0 && (
                        <EmptyState
                          icon={<Bookmark className="h-7 w-7" />}
                          title="No bookmarked stories"
                          description="Stories you bookmark will be saved here."
                        />
                      )}

                    <div className="grid gap-6 md:grid-cols-2 items-start">
                      {controller.savedStories.map((story) => (
                        <StoryCard
                          key={story._id}
                          story={story}
                          variant="grid"
                        />
                      ))}
                    </div>

                    {controller.savedStoriesHasMore && (
                      <LoadMoreButton
                        loading={controller.savedStoriesLoading}
                        onClick={() =>
                          void controller.handleLoadMoreSavedStories()
                        }
                      />
                    )}
                  </div>
                ) : null}

                {controller.savedTab === "polls" ? (
                  <div className="space-y-6">
                    {controller.savedPollsError && (
                      <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-muted-foreground">
                        {controller.savedPollsError}
                      </div>
                    )}

                    {!controller.savedPollsError &&
                      !controller.savedPollsLoading &&
                      controller.savedPolls.length === 0 && (
                        <EmptyState
                          icon={<Bookmark className="h-7 w-7" />}
                          title="No bookmarked polls"
                          description="Polls you bookmark will show up here."
                        />
                      )}

                    <div className="space-y-6">
                      {controller.savedPolls.map((poll) => (
                        <PollCard
                          key={poll.id}
                          poll={poll}
                          onUpdate={controller.handleSavedPollUpdate}
                          onDelete={
                            controller.isOwnProfile
                              ? controller.handleDeleteSavedPoll
                              : undefined
                          }
                        />
                      ))}
                    </div>

                    {controller.savedPollsHasMore && (
                      <LoadMoreButton
                        loading={controller.savedPollsLoading}
                        onClick={() =>
                          void controller.handleLoadMoreSavedPolls()
                        }
                      />
                    )}
                  </div>
                ) : null}
              </div>
            )
          ) : null}
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
