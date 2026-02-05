import { useState } from "react";
import { Camera, Calendar, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { ProfileHeaderUser } from "./types";

export function ProfileHeaderCard({
  user,
  isOwnProfile,
  isFollowing,
  displayName,
  joinedDate,
  onEditProfileClick,
  onFollowClick,
  onOpenFollowers,
  onOpenFollowing,
  onOpenMutual,
}: {
  user: ProfileHeaderUser;
  isOwnProfile: boolean;
  isFollowing: boolean;
  displayName: string;
  joinedDate: string;
  onEditProfileClick: () => void;
  onFollowClick: () => void;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  onOpenMutual: () => void;
}) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const formatStatNumber = (value?: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value ?? 0);
    return formatted.replace(/([KMBT])/g, (m) => m.toLowerCase());
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      <div className="relative h-48 sm:h-56 lg:h-64">
        {user.coverImage ? (
          <div className="relative h-full">
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
              onLoad={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={onEditProfileClick}
              className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm">
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
        )}
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={user.profileImage}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {displayName}
                </h1>
                {user.isVerified && (
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                @{user.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={onEditProfileClick}
                className="flex-1 sm:flex-none rounded-full">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={onFollowClick}
                  className="flex-1 sm:flex-none">
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {user.bio && (
            <p className="text-foreground text-sm sm:text-base leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>

          <div className="mt-2 -mx-6 px-6 py-5 bg-[#0b1020]/60 border-t border-white/5">
            <div className="grid grid-cols-3">
              <div className="text-center">
                <div className="text-[#3b82f6] text-3xl font-extrabold leading-none tabular-nums">
                  {formatStatNumber(user.reactionsReceived)}
                </div>
                <div className="mt-2 text-[11px] font-bold tracking-widest text-[#64748b] uppercase">
                  Reactions
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenFollowers}
                className="text-center transition-opacity hover:opacity-90">
                <div className="text-[#3b82f6] text-3xl font-extrabold leading-none tabular-nums">
                  {formatStatNumber(user.followersCount)}
                </div>
                <div className="mt-2 text-[11px] font-bold tracking-widest text-[#64748b] uppercase">
                  Followers
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenFollowing}
                className="text-center transition-opacity hover:opacity-90">
                <div className="text-[#3b82f6] text-3xl font-extrabold leading-none tabular-nums">
                  {formatStatNumber(user.followingCount)}
                </div>
                <div className="mt-2 text-[11px] font-bold tracking-widest text-[#64748b] uppercase">
                  Following
                </div>
              </button>
            </div>

            {!isOwnProfile && typeof user.mutualFollows === "number" && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenMutual}
                  className="text-sm text-muted-foreground hover:underline transition-colors">
                  {formatStatNumber(user.mutualFollows)} Mutual
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
