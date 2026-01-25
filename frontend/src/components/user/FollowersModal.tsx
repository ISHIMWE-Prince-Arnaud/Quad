import { useState, useEffect, useCallback } from "react";
import type { UserCardData } from "@/components/user/UserCard";
import { FollowService } from "@/services/followService";
import type { ApiFollowUser } from "@/types/api";
import { logError } from "@/lib/errorHandling";

import { FollowersModalBody } from "./followers-modal/FollowersModalBody";
import { FollowersModalFooter } from "./followers-modal/FollowersModalFooter";
import { FollowersModalHeader } from "./followers-modal/FollowersModalHeader";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following" | "mutual";
  initialCount?: number;
}

// Convert API follow user to UserCardData
const convertApiFollowUserToUserCard = (
  followUser: ApiFollowUser
): UserCardData => ({
  _id: followUser._id,
  clerkId: followUser.clerkId,
  username: followUser.username,
  email: "", // Not provided in follow lists
  firstName: followUser.firstName,
  lastName: followUser.lastName,
  profileImage: followUser.profileImage,
  bio: followUser.bio,
  isVerified: followUser.isVerified,
  followers: 0, // Not provided in follow lists
  following: 0, // Not provided in follow lists
  postsCount: 0, // Not provided in follow lists
  joinedAt: followUser.followedAt || new Date().toISOString(),
  isFollowing: followUser.isFollowing,
});

// Real API functions using backend endpoints
const getFollowers = async (
  userId: string,
  page: number,
  limit: number
): Promise<{ users: UserCardData[]; hasMore: boolean; total: number }> => {
  try {
    const result = await FollowService.getFollowers(userId, { page, limit });
    return {
      users: result.followers.map(convertApiFollowUserToUserCard),
      hasMore: result.hasMore,
      total: result.total,
    };
  } catch (error) {
    logError(error, {
      component: "FollowersModal",
      action: "getFollowers",
      metadata: { userId, page, limit },
    });
    return { users: [], hasMore: false, total: 0 };
  }
};

const getFollowing = async (
  userId: string,
  page: number,
  limit: number
): Promise<{ users: UserCardData[]; hasMore: boolean; total: number }> => {
  try {
    const result = await FollowService.getFollowing(userId, { page, limit });
    return {
      users: result.following.map(convertApiFollowUserToUserCard),
      hasMore: result.hasMore,
      total: result.total,
    };
  } catch (error) {
    logError(error, {
      component: "FollowersModal",
      action: "getFollowing",
      metadata: { userId, page, limit },
    });
    return { users: [], hasMore: false, total: 0 };
  }
};

const getMutualFollowsForUser = async (
  userId: string
): Promise<{ users: UserCardData[]; total: number }> => {
  try {
    const result = await FollowService.getMutualFollows(userId);
    return {
      users: result.mutualFollows.map(convertApiFollowUserToUserCard),
      total: result.count,
    };
  } catch (error) {
    logError(error, {
      component: "FollowersModal",
      action: "getMutualFollowsForUser",
      metadata: { userId },
    });
    return { users: [], total: 0 };
  }
};

export function FollowersModal({
  isOpen,
  onClose,
  userId,
  type,
  initialCount = 0,
}: FollowersModalProps) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount || 0);

  const loadUsers = useCallback(
    async (pageToLoad: number = 1) => {
      if (pageToLoad === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        if (type === "followers") {
          const result = await getFollowers(userId, pageToLoad, 20);
          setUsers((prev) =>
            pageToLoad === 1 ? result.users : [...prev, ...result.users]
          );
          setHasMore(result.hasMore);
          setTotalCount(result.total || initialCount || result.users.length);
        } else if (type === "following") {
          const result = await getFollowing(userId, pageToLoad, 20);
          setUsers((prev) =>
            pageToLoad === 1 ? result.users : [...prev, ...result.users]
          );
          setHasMore(result.hasMore);
          setTotalCount(result.total || initialCount || result.users.length);
        } else {
          const result = await getMutualFollowsForUser(userId);
          setUsers(result.users);
          setHasMore(false);
          setTotalCount(result.total || initialCount || result.users.length);
        }

        setPage(pageToLoad);
      } catch (error) {
        logError(error, {
          component: "FollowersModal",
          action: "loadUsers",
          metadata: { userId, type, pageToLoad },
        });
      } finally {
        if (pageToLoad === 1) {
          setIsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [userId, type, initialCount]
  );

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setPage(1);
      loadUsers(1);
    }
  }, [isOpen, loadUsers]);

  // Handle follow/unfollow
  const handleFollow = async (targetUserId: string) => {
    try {
      await FollowService.followUser(targetUserId);

      setUsers((prev) =>
        prev.map((user) =>
          user.clerkId === targetUserId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      logError(error, {
        component: "FollowersModal",
        action: "followUser",
        metadata: { targetUserId },
      });
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || type === "mutual") return;
    loadUsers(page + 1);
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await FollowService.unfollowUser(targetUserId);

      setUsers((prev) =>
        prev.map((user) =>
          user.clerkId === targetUserId ? { ...user, isFollowing: false } : user
        )
      );
    } catch (error) {
      logError(error, {
        component: "FollowersModal",
        action: "unfollowUser",
        metadata: { targetUserId },
      });
    }
  };

  if (!isOpen) return null;

  const title =
    type === "followers"
      ? "Followers"
      : type === "following"
      ? "Following"
      : "Mutual Connections";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-lg shadow-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <FollowersModalHeader title={title} onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <FollowersModalBody
            isLoading={isLoading}
            users={users}
            type={type}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        </div>

        {/* Footer with count and pagination */}
        <FollowersModalFooter
          isLoading={isLoading}
          users={users}
          totalCount={totalCount || users.length}
          type={type}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}
