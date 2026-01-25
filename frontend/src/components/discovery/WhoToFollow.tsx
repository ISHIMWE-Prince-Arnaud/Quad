import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCard, type UserCardData } from "@/components/user/UserCard";
import { FollowService } from "@/services/followService";
import { logError } from "@/lib/errorHandling";
import { cn } from "@/lib/utils";

interface WhoToFollowProps {
  limit?: number;
  showRefresh?: boolean;
  compact?: boolean;
  className?: string;
}

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
        setSuggestions([]);
      } catch (error) {
        logError(error, {
          component: "WhoToFollow",
          action: "fetchSuggestions",
          metadata: { limit, showSkeleton },
        });
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
      logError(error, {
        component: "WhoToFollow",
        action: "followUser",
        metadata: { userId },
      });
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
      logError(error, {
        component: "WhoToFollow",
        action: "unfollowUser",
        metadata: { userId },
      });
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
    <Card className={cn("bg-[#0f121a] border border-white/5 rounded-3xl overflow-hidden shadow-xl", className)}>
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-[#2563eb]" />
            Active Users
          </CardTitle>
          {showRefresh && (
            <button
              onClick={refreshSuggestions}
              disabled={isRefreshing}
              className="p-2 text-[#64748b] hover:text-white transition-colors">
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
                  <div className="h-2 bg-white/5 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((user) => (
              <div key={user._id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-white/5">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-[#1e293b] text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a0c10] rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white leading-tight">{user.firstName} {user.lastName}</h4>
                    <p className="text-[11px] font-medium text-[#64748b]">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => user.isFollowing ? handleUnfollow(user._id) : handleFollow(user._id)}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all",
                    user.isFollowing
                      ? "bg-white/5 text-white hover:bg-white/10"
                      : "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-[#2563eb]/20"
                  )}>
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#64748b]">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No active users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
