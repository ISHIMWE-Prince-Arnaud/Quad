import { useCallback, useEffect, useState } from "react";

import type { NavigateFunction } from "react-router-dom";

import type { ProfileTab } from "@/components/profile/ProfileTabs";
import { BookmarkService } from "@/services/bookmarkService";
import { FollowService } from "@/services/followService";
import { ProfileService } from "@/services/profileService";
import type { ApiProfile } from "@/types/api";
import { logError } from "@/lib/errorHandling";

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
    handleFollow,
    handleUnfollow,
    handleEditProfile,
    handleUserUpdate,
  };
}
