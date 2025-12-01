import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard, type UserCardData } from "@/components/user/UserCard";
import { FollowService } from "@/services/followService";
import { SearchService } from "@/services/searchService";
import type { ApiProfile } from "@/types/api";

interface WhoToFollowProps {
  limit?: number;
  showRefresh?: boolean;
  compact?: boolean;
  className?: string;
}

const convertProfileToUserCard = (profile: ApiProfile): UserCardData => ({
  _id: profile._id,
  clerkId: profile.clerkId,
  username: profile.username,
  email: profile.email,
  firstName: profile.firstName,
  lastName: profile.lastName,
  profileImage: profile.profileImage,
  coverImage: profile.coverImage,
  bio: profile.bio,
  isVerified: profile.isVerified,
  followers: profile.followers,
  following: profile.following,
  postsCount: profile.postsCount,
  joinedAt: profile.joinedAt || profile.createdAt || new Date().toISOString(),
  isFollowing: profile.isFollowing,
});

export function WhoToFollow({
  limit = 3,
  showRefresh = true,
  compact = false,
  className = "",
}: WhoToFollowProps) {
  const [suggestions, setSuggestions] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSuggestions = useCallback(
    async (showSkeleton: boolean) => {
      if (showSkeleton) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const result = await SearchService.searchUsers({
          q: "",
          limit: Math.max(limit * 2, limit),
          sortBy: "followers",
        });

        const normalized = result.results
          .map(convertProfileToUserCard)
          .filter((user) => Boolean(user.clerkId));

        const randomized = normalized
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);

        setSuggestions(randomized);
      } catch (error) {
        console.error("Failed to load user suggestions:", error);
      } finally {
        if (showSkeleton) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [limit]
  );

  const loadSuggestions = useCallback(() => {
    void fetchSuggestions(true);
  }, [fetchSuggestions]);

  // Load initial suggestions
  useEffect(() => {
    loadSuggestions();
  }, [limit, loadSuggestions]);

  const refreshSuggestions = async () => {
    await fetchSuggestions(false);
  };

  // Handle follow/unfollow
  const handleFollow = async (userId: string) => {
    try {
      await FollowService.followUser(userId);

      // Update local state
      setSuggestions((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                isFollowing: true,
                followers: (user.followers || 0) + 1,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await FollowService.unfollowUser(userId);

      // Update local state
      setSuggestions((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                isFollowing: false,
                followers: Math.max((user.followers || 1) - 1, 0),
              }
            : user
        )
      );
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Who to follow</h3>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              disabled={isRefreshing}
              className="h-6 w-6 p-0">
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                compact={true}
                showBio={false}
                showStats={false}
                className="hover:bg-accent/50"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Users className="h-6 w-6" />
            <p className="text-xs">No suggestions available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Who to follow</CardTitle>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              disabled={isRefreshing}
              className="h-8 w-8 p-0">
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((user, index) => (
              <div key={user._id}>
                <UserCard
                  user={user}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  compact={true}
                  showBio={true}
                  showStats={false}
                  className="border-0 shadow-none hover:bg-accent/50 transition-colors"
                />
                {index < suggestions.length - 1 && (
                  <div className="border-t mt-3" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Users className="h-8 w-8" />
            <div className="text-center">
              <p className="font-medium">No suggestions available</p>
              <p className="text-sm">
                Check back later for new recommendations
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
