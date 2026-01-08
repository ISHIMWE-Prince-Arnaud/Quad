import { useCallback, useEffect, useMemo, useState } from "react";

import type { NavigateFunction } from "react-router-dom";

import type { ProfileTab } from "@/components/profile/ProfileTabs";
import type { ContentItem } from "@/components/profile/ProfileContentGrid";
import { BookmarkService } from "@/services/bookmarkService";
import { FollowService } from "@/services/followService";
import { PollService } from "@/services/pollService";
import { PostService } from "@/services/postService";
import { ProfileService } from "@/services/profileService";
import { ReactionService } from "@/services/reactionService";
import { StoryService } from "@/services/storyService";
import type { ApiProfile } from "@/types/api";
import { logError } from "@/lib/errorHandling";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

  // Load user's content based on active tab
  const loadUserContent = useCallback(async (
    nextPage: number,
    mode: "replace" | "append"
  ) => {
    if (!username) return;

    try {
      let result;
      switch (activeTab) {
        case "posts":
          result = await ProfileService.getUserContent(username, "posts", {
            page: nextPage,
            limit: 20,
          });
          break;
        case "stories":
          result = await ProfileService.getUserContent(username, "stories", {
            page: nextPage,
            limit: 20,
          });
          break;
        case "polls":
          result = await ProfileService.getUserContent(username, "polls", {
            page: nextPage,
            limit: 20,
          });
          break;
        case "saved":
          if (!isOwnProfile) {
            setContent([]);
            setHasMore(false);
            return;
          }
          {
            const limit = 20;
            const offset = (nextPage - 1) * limit;
            const ids = BookmarkService.list();
            const pageIds = ids.slice(offset, offset + limit);

            const fetchedItems = (
              await Promise.all(
                pageIds.map(async (id): Promise<ContentItem | null> => {
                  try {
                    const postRes = await PostService.getPostById(id);
                    if (postRes.success && postRes.data) {
                      const images =
                        postRes.data.media
                          ?.filter((m) => m.type === "image")
                          .map((m) => m.url);

                      return {
                        _id: postRes.data._id,
                        type: "post",
                        createdAt: postRes.data.createdAt,
                        updatedAt: postRes.data.updatedAt,
                        content: postRes.data.text ?? "",
                        ...(images ? { images } : {}),
                        author: {
                          _id: postRes.data.author.clerkId,
                          username: postRes.data.author.username,
                          firstName: postRes.data.author.firstName,
                          lastName: postRes.data.author.lastName,
                          profileImage: postRes.data.author.profileImage,
                        },
                        likes: postRes.data.reactionsCount ?? 0,
                        comments: postRes.data.commentsCount ?? 0,
                      };
                    }
                  } catch {
                    // ignore
                  }

                  try {
                    const storyRes = await StoryService.getById(id);
                    if (storyRes.success && storyRes.data) {
                      return {
                        _id: storyRes.data._id,
                        type: "story",
                        createdAt: storyRes.data.createdAt,
                        updatedAt: storyRes.data.updatedAt,
                        content: storyRes.data.content ?? "",
                        title: storyRes.data.title,
                        ...(storyRes.data.coverImage
                          ? { coverImage: storyRes.data.coverImage }
                          : {}),
                        ...(storyRes.data.readTime !== undefined
                          ? { readTime: storyRes.data.readTime }
                          : {}),
                        author: {
                          _id: storyRes.data.author.clerkId,
                          username: storyRes.data.author.username,
                          profileImage: storyRes.data.author.profileImage,
                        },
                        likes: storyRes.data.reactionsCount ?? 0,
                        comments: storyRes.data.commentsCount ?? 0,
                      };
                    }
                  } catch {
                    // ignore
                  }

                  try {
                    const pollRes = await PollService.getById(id);
                    if (pollRes.success && pollRes.data) {
                      return {
                        _id: pollRes.data.id,
                        type: "poll",
                        createdAt: pollRes.data.createdAt,
                        updatedAt: pollRes.data.updatedAt,
                        question: pollRes.data.question,
                        options: pollRes.data.options.map((o) => ({
                          id: String(o.index),
                          text: o.text,
                          votes: o.votesCount ?? 0,
                        })),
                        totalVotes: pollRes.data.totalVotes,
                        ...(pollRes.data.expiresAt
                          ? { endsAt: pollRes.data.expiresAt }
                          : {}),
                        ...(pollRes.data.userVote && pollRes.data.userVote.length > 0
                          ? { hasVoted: true }
                          : {}),
                        author: {
                          _id: pollRes.data.author._id,
                          username: pollRes.data.author.username,
                          firstName: pollRes.data.author.firstName,
                          lastName: pollRes.data.author.lastName,
                          profileImage: pollRes.data.author.profileImage,
                        },
                        likes: pollRes.data.reactionsCount ?? 0,
                        comments: pollRes.data.commentsCount ?? 0,
                      };
                    }
                  } catch {
                    // ignore
                  }

                  return null;
                })
              )
            ).filter((x): x is ContentItem => x !== null);

            result = {
              items: fetchedItems,
              hasMore: offset + pageIds.length < ids.length,
              total: ids.length,
            };
          }
          break;
        case "liked":
          if (!isOwnProfile) {
            setContent([]);
            setHasMore(false);
            return;
          }
          {
            const limit = 20;
            const skip = (nextPage - 1) * limit;

            const reactionsRes = await ReactionService.getUserReactions({
              limit,
              skip,
            });

            const likedContentRefs = (reactionsRes.data || []).filter((r) => {
              return (
                r.type === "like" &&
                (r.contentType === "post" || r.contentType === "story" || r.contentType === "poll")
              );
            });

            const fetchedItems = (
              await Promise.all(
                likedContentRefs.map(async (r): Promise<ContentItem | null> => {
                  try {
                    if (r.contentType === "post") {
                      const postRes = await PostService.getPostById(r.contentId);
                      if (postRes.success && postRes.data) {
                        const images =
                          postRes.data.media
                            ?.filter((m) => m.type === "image")
                            .map((m) => m.url);

                        return {
                          _id: postRes.data._id,
                          type: "post",
                          createdAt: postRes.data.createdAt,
                          updatedAt: postRes.data.updatedAt,
                          content: postRes.data.text ?? "",
                          ...(images ? { images } : {}),
                          author: {
                            _id: postRes.data.author.clerkId,
                            username: postRes.data.author.username,
                            firstName: postRes.data.author.firstName,
                            lastName: postRes.data.author.lastName,
                            profileImage: postRes.data.author.profileImage,
                          },
                          likes: postRes.data.reactionsCount ?? 0,
                          comments: postRes.data.commentsCount ?? 0,
                          isLiked: true,
                        };
                      }
                      return null;
                    }

                    if (r.contentType === "story") {
                      const storyRes = await StoryService.getById(r.contentId);
                      if (storyRes.success && storyRes.data) {
                        return {
                          _id: storyRes.data._id,
                          type: "story",
                          createdAt: storyRes.data.createdAt,
                          updatedAt: storyRes.data.updatedAt,
                          content: storyRes.data.content ?? "",
                          title: storyRes.data.title,
                          isLiked: true,
                          ...(storyRes.data.coverImage
                            ? { coverImage: storyRes.data.coverImage }
                            : {}),
                          ...(storyRes.data.readTime !== undefined
                            ? { readTime: storyRes.data.readTime }
                            : {}),
                          author: {
                            _id: storyRes.data.author.clerkId,
                            username: storyRes.data.author.username,
                            profileImage: storyRes.data.author.profileImage,
                          },
                          likes: storyRes.data.reactionsCount ?? 0,
                          comments: storyRes.data.commentsCount ?? 0,
                        };
                      }
                      return null;
                    }

                    if (r.contentType === "poll") {
                      const pollRes = await PollService.getById(r.contentId);
                      if (pollRes.success && pollRes.data) {
                        return {
                          _id: pollRes.data.id,
                          type: "poll",
                          createdAt: pollRes.data.createdAt,
                          updatedAt: pollRes.data.updatedAt,
                          question: pollRes.data.question,
                          options: pollRes.data.options.map((o) => ({
                            id: String(o.index),
                            text: o.text,
                            votes: o.votesCount ?? 0,
                          })),
                          totalVotes: pollRes.data.totalVotes,
                          isLiked: true,
                          ...(pollRes.data.expiresAt
                            ? { endsAt: pollRes.data.expiresAt }
                            : {}),
                          ...(pollRes.data.userVote && pollRes.data.userVote.length > 0
                            ? { hasVoted: true }
                            : {}),
                          author: {
                            _id: pollRes.data.author._id,
                            username: pollRes.data.author.username,
                            firstName: pollRes.data.author.firstName,
                            lastName: pollRes.data.author.lastName,
                            profileImage: pollRes.data.author.profileImage,
                          },
                          likes: pollRes.data.reactionsCount ?? 0,
                          comments: pollRes.data.commentsCount ?? 0,
                        };
                      }
                      return null;
                    }
                  } catch {
                    return null;
                  }

                  return null;
                })
              )
            ).filter((x): x is ContentItem => x !== null);

            result = {
              items: fetchedItems,
              hasMore: reactionsRes.pagination?.hasMore || false,
              total: reactionsRes.pagination?.total || fetchedItems.length,
            };
          }
          break;
        default:
          setContent([]);
          setHasMore(false);
          return;
      }

      const convertedItems = result.items.map((item) => ({
        ...item,
        updatedAt: item.createdAt,
      })) as ContentItem[];
      setContent((prev) => (mode === "append" ? [...prev, ...convertedItems] : convertedItems));
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (err) {
      logError(err, {
        component: "ProfilePage",
        action: "loadUserContent",
        metadata: { activeTab },
      });
      setContent([]);
      setHasMore(false);
    }
  }, [username, activeTab, isOwnProfile]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadUserContent(page + 1, "append");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadUserContent, loadingMore, page]);

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
          logError(statsError, {
            component: "ProfilePage",
            action: "getFollowStats",
            metadata: { profileClerkId: profileData.clerkId },
          });
        }

        setUser(profileData);

        if (!isOwnProfile) {
          const followStatus = await FollowService.checkFollowing(profileData.clerkId);
          setIsFollowing(followStatus.isFollowing);
        }

        setPage(1);
        setHasMore(false);
        await loadUserContent(1, "replace");
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

  useEffect(() => {
    if (!username) return;
    setPage(1);
    setHasMore(false);
    setContent([]);
    void loadUserContent(1, "replace");
  }, [activeTab, loadUserContent, username]);

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
          : prev
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
    loadingMore,
    error,
    isNotFound,
    isFollowing,
    isOwnProfile,
    filteredContent,
    hasMore,
    postCount,
    storyCount,
    pollCount,
    handleFollow,
    handleUnfollow,
    handleEditProfile,
    handleUserUpdate,
    handleLoadMore,
  };
}
