import { useCallback, useEffect, useState } from "react";

import type { NavigateFunction } from "react-router-dom";

import type { ProfileTab } from "@/components/profile/ProfileTabs";
import { BookmarkService } from "@/services/bookmarkService";
import { FollowService } from "@/services/followService";
import { PostService } from "@/services/postService";
import { ProfileService } from "@/services/profileService";
import type { ApiProfile } from "@/types/api";
import type { Post } from "@/types/post";
import { logError } from "@/lib/errorHandling";
import toast from "react-hot-toast";

type AuthUser = {
  clerkId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  bio?: string;
};

type SetAuthUser = (user: AuthUser) => void;

type UseProfilePageControllerArgs = {
  username?: string;
  navigate: NavigateFunction;
  currentUser: AuthUser | null;
  authLoading: boolean;
  setAuthUser: SetAuthUser;
};

export function useProfilePageController({
  username,
  navigate,
  currentUser,
  authLoading,
  setAuthUser,
}: UseProfilePageControllerArgs) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [user, setUser] = useState<ApiProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState(0);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

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

          if (status === 404 && currentUser?.clerkId) {
            profileData = await ProfileService.getProfileById(
              currentUser.clerkId,
            );

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

        try {
          const followStats = await FollowService.getFollowStats(
            profileData.clerkId,
          );
          profileData = {
            ...profileData,
            followers: followStats.followers,
            following: followStats.following,
            mutualFollows: followStats.mutualFollows,
          };
        } catch (statsError) {
          logError(statsError, {
            component: "ProfilePage",
            action: "getFollowStats",
            metadata: { profileClerkId: profileData.clerkId },
          });
        }

        setUser(profileData);

        if (!isOwnProfile) {
          const followStatus = await FollowService.checkFollowing(
            profileData.clerkId,
          );
          setIsFollowing(followStatus.isFollowing);
        }
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
            "Something went wrong while loading this profile. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (username && !authLoading) {
      void fetchProfileData();
    }
  }, [username, authLoading, currentUser?.clerkId, navigate, isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile || authLoading) {
      setBookmarksCount(0);
      return;
    }

    const fetchBookmarksCount = async () => {
      try {
        const res = await BookmarkService.list({ page: 1, limit: 1 });
        setBookmarksCount(res.pagination?.total ?? 0);
      } catch (err) {
        logError(err, {
          component: "ProfilePage",
          action: "getBookmarksCount",
        });
        setBookmarksCount(0);
      }
    };

    void fetchBookmarksCount();
  }, [authLoading, isOwnProfile]);

  useEffect(() => {
    if (!username || authLoading) return;

    if (activeTab !== "posts") return;

    let cancelled = false;

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);
        setPosts([]);
        setPostsPage(1);
        setPostsHasMore(false);

        const res = await ProfileService.getUserPostsAsPosts(username, {
          page: 1,
          limit: 20,
        });

        if (cancelled) return;

        setPosts(res.posts);
        setPostsPage(1);
        setPostsHasMore(Boolean(res.hasMore));
      } catch (e) {
        logError(e, {
          component: "ProfilePage",
          action: "getUserPostsAsPosts",
          metadata: { username },
        });

        if (!cancelled) {
          setPostsError("Failed to load posts");
          setPosts([]);
          setPostsHasMore(false);
        }
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    };

    void fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [activeTab, authLoading, username]);

  const handleLoadMorePosts = useCallback(async () => {
    if (!username) return;
    if (activeTab !== "posts") return;
    if (postsLoading || !postsHasMore) return;

    try {
      setPostsLoading(true);
      setPostsError(null);

      const nextPage = postsPage + 1;
      const res = await ProfileService.getUserPostsAsPosts(username, {
        page: nextPage,
        limit: 20,
      });

      setPosts((prev) => [...prev, ...res.posts]);
      setPostsPage(nextPage);
      setPostsHasMore(Boolean(res.hasMore));
    } catch (e) {
      logError(e, {
        component: "ProfilePage",
        action: "getUserPostsAsPosts.loadMore",
        metadata: { username, postsPage },
      });
      setPostsError("Failed to load more posts");
    } finally {
      setPostsLoading(false);
    }
  }, [activeTab, postsHasMore, postsLoading, postsPage, username]);

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const res = await PostService.deletePost(postId);

      if (!res?.success) {
        toast.error(res?.message || "Failed to delete post");
        return;
      }

      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setUser((prev) =>
        prev
          ? {
              ...prev,
              postsCount: Math.max((prev.postsCount ?? 0) - 1, 0),
            }
          : prev,
      );

      toast.success("Post deleted successfully");
    } catch (e) {
      logError(e, {
        component: "ProfilePage",
        action: "deletePost",
        metadata: { postId },
      });
      toast.error("Failed to delete post");
    }
  }, []);

  // Handle follow/unfollow
  const handleFollow = useCallback(async () => {
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
          : prev,
      );
    } catch (err) {
      logError(err, {
        component: "ProfilePage",
        action: "followUser",
        metadata: { targetClerkId: user.clerkId },
      });
    }
  }, [user]);

  const handleUnfollow = useCallback(async () => {
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
          : prev,
      );
    } catch (err) {
      logError(err, {
        component: "ProfilePage",
        action: "unfollowUser",
        metadata: { targetClerkId: user.clerkId },
      });
    }
  }, [user]);

  const handleEditProfile = useCallback(() => {
    // no-op
  }, []);

  const handleUserUpdate = useCallback(
    (updatedUser: Partial<ApiProfile>) => {
      setUser((prev) =>
        prev ? ({ ...prev, ...updatedUser } as ApiProfile) : prev,
      );

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
            profileImage: updatedUser.profileImage ?? currentUser.profileImage,
            bio: updatedUser.bio ?? currentUser.bio,
          });
        }

        navigate(`/app/profile/${updatedUser.username}`, { replace: true });
      }
    },
    [currentUser, isOwnProfile, navigate, setAuthUser, username],
  );

  return {
    activeTab,
    setActiveTab,
    user,
    loading,
    error,
    isNotFound,
    isFollowing,
    isOwnProfile,
    bookmarksCount,
    posts,
    postsLoading,
    postsError,
    postsHasMore,
    handleLoadMorePosts,
    handleDeletePost,
    handleFollow,
    handleUnfollow,
    handleEditProfile,
    handleUserUpdate,
  };
}
