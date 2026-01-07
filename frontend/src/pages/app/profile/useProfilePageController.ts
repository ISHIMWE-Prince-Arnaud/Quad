import { useCallback, useEffect, useMemo, useState } from "react";

import type { NavigateFunction } from "react-router-dom";

import type { ProfileTab } from "@/components/profile/ProfileTabs";
import type { ContentItem } from "@/components/profile/ProfileContentGrid";
import { FollowService } from "@/services/followService";
import { ProfileService } from "@/services/profileService";
import type { ApiProfile } from "@/types/api";

import { filterProfileContent, getProfileContentCounts } from "./filterProfileContent";

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
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

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
          setContent([]);
          return;
        default:
          setContent([]);
          return;
      }

      const convertedItems = result.items.map((item) => ({
        ...item,
        updatedAt: item.createdAt,
      })) as ContentItem[];
      setContent(convertedItems);
    } catch (err) {
      console.error(`Failed to load ${activeTab}:`, err);
      setContent([]);
    }
  }, [username, activeTab]);

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
            typeof (err as { response?: { status?: number } }).response?.status === "number"
          ) {
            status = (err as { response?: { status?: number } }).response?.status;
          }

          if (status === 404 && currentUser?.clerkId) {
            profileData = await ProfileService.getProfileById(currentUser.clerkId);

            if (profileData?.username && profileData.username !== username) {
              navigate(`/app/profile/${profileData.username}`, { replace: true });
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
          const followStats = await FollowService.getFollowStats(profileData.clerkId);
          profileData = {
            ...profileData,
            followers: followStats.followers,
            following: followStats.following,
            mutualFollows: followStats.mutualFollows,
          };
        } catch (statsError) {
          console.error("Failed to load follow stats:", statsError);
        }

        setUser(profileData);

        if (!isOwnProfile) {
          const followStatus = await FollowService.checkFollowing(profileData.clerkId);
          setIsFollowing(followStatus.isFollowing);
        }

        await loadUserContent();
      } catch (err: unknown) {
        let status: number | undefined;

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { status?: number } }).response?.status === "number"
        ) {
          status = (err as { response?: { status?: number } }).response?.status;
        }

        if (status === 404) {
          setIsNotFound(true);
          setError("This profile does not exist or is no longer available.");
        } else {
          setIsNotFound(false);
          setError("Something went wrong while loading this profile. Please try again.");
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
      void fetchProfileData();
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

  // Filter content based on active tab
  const filteredContent = useMemo(() => {
    return filterProfileContent(content, activeTab);
  }, [content, activeTab]);

  // Get content counts
  const { postCount, storyCount, pollCount } = useMemo(() => {
    return getProfileContentCounts(content);
  }, [content]);

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
          : prev
      );
    } catch (err) {
      console.error("Failed to follow user:", err);
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
          : prev
      );
    } catch (err) {
      console.error("Failed to unfollow user:", err);
    }
  }, [user]);

  const handleEditProfile = useCallback(() => {
    console.log("Edit profile clicked");
  }, []);

  const handleUserUpdate = useCallback(
    (updatedUser: Partial<ApiProfile>) => {
      setUser((prev) => (prev ? ({ ...prev, ...updatedUser } as ApiProfile) : prev));

      if (isOwnProfile && updatedUser.username && updatedUser.username !== username) {
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
    [currentUser, isOwnProfile, navigate, setAuthUser, username]
  );

  return {
    activeTab,
    setActiveTab,
    user,
    content,
    loading,
    error,
    isNotFound,
    isFollowing,
    isOwnProfile,
    filteredContent,
    postCount,
    storyCount,
    pollCount,
    handleFollow,
    handleUnfollow,
    handleEditProfile,
    handleUserUpdate,
  };
}
