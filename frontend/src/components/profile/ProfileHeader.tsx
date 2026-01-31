import { useState } from "react";
import { Camera, Calendar, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EditProfileModal } from "./EditProfileModal";
import { FollowersModal } from "@/components/user/FollowersModal";

import { useProfileHeaderController } from "./profile-header/useProfileHeaderController";
import type { ProfileHeaderProps } from "./profile-header/types";

export function ProfileHeader({
  user,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onEditProfile,
  onUserUpdate,
}: ProfileHeaderProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const controller = useProfileHeaderController({
    user,
    isFollowing,
    onFollow,
    onUnfollow,
    onEditProfile,
    onUserUpdate,
  });

  const displayName = controller.displayName;
  const joinedDate = controller.joinedDate;
  const isEditModalOpen = controller.isEditModalOpen;
  const setIsEditModalOpen = controller.setIsEditModalOpen;
  const followersModalOpen = controller.followersModalOpen;
  const setFollowersModalOpen = controller.setFollowersModalOpen;
  const followingModalOpen = controller.followingModalOpen;
  const setFollowingModalOpen = controller.setFollowingModalOpen;
  const mutualModalOpen = controller.mutualModalOpen;
  const setMutualModalOpen = controller.setMutualModalOpen;
  const handleFollowClick = controller.handleFollowClick;

  // Handle edit profile modal
  const handleEditProfileClick = controller.handleEditProfileClick;

  // Handle profile save
  const handleProfileSave = controller.handleProfileSave;

  return (
    <>
      <Card className="relative overflow-hidden border-0 shadow-lg">
        {/* Cover Image with Gradient Background */}
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

          {/* Cover Image Actions (for own profile) */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleEditProfileClick}
                className="bg-black/20 hover:bg-black/30 text-white border-white/20 backdrop-blur-sm">
                <Camera className="h-4 w-4 mr-2" />
                Edit Cover
              </Button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
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

                {/* Profile Picture Edit Button (for own profile) */}
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 shadow-lg">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
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

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  onClick={handleEditProfileClick}
                  className="flex-1 sm:flex-none rounded-full">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollowClick}
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

          {/* Profile Details */}
          <div className="mt-6 space-y-4">
            {/* Bio */}
            {user.bio && (
              <p className="text-foreground text-sm sm:text-base leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => setFollowingModalOpen(true)}
                className="flex gap-1 hover:underline transition-colors">
                <span className="font-semibold text-foreground">
                  {user.following?.toLocaleString() || 0}
                </span>
                <span className="text-muted-foreground">Following</span>
              </button>
              <button
                onClick={() => setFollowersModalOpen(true)}
                className="flex gap-1 hover:underline transition-colors">
                <span className="font-semibold text-foreground">
                  {user.followers?.toLocaleString() || 0}
                </span>
                <span className="text-muted-foreground">Followers</span>
              </button>
              <div className="flex gap-1">
                <span className="font-semibold text-foreground">
                  {user.reactionsReceived?.toLocaleString() || 0}
                </span>
                <span className="text-muted-foreground">Reactions</span>
              </div>
              {!isOwnProfile && typeof user.mutualFollows === "number" && (
                <button
                  type="button"
                  onClick={() => setMutualModalOpen(true)}
                  className="flex gap-1 hover:underline transition-colors">
                  <span className="font-semibold text-foreground">
                    {user.mutualFollows.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">Mutual</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />

      {/* Followers Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={user.clerkId}
        type="followers"
        initialCount={user.followers}
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={user.clerkId}
        type="following"
        initialCount={user.following}
      />

      {/* Mutual Connections Modal */}
      {!isOwnProfile && typeof user.mutualFollows === "number" && (
        <FollowersModal
          isOpen={mutualModalOpen}
          onClose={() => setMutualModalOpen(false)}
          userId={user.clerkId}
          type="mutual"
          initialCount={user.mutualFollows}
        />
      )}
    </>
  );
}
