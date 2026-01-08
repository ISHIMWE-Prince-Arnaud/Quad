import { useMemo, useState } from "react";

import { ProfileService } from "@/services/profileService";

import type { ProfileHeaderProps } from "./types";

export function useProfileHeaderController({
  user,
  isFollowing,
  onFollow,
  onUnfollow,
  onEditProfile,
  onUserUpdate,
}: {
  user: ProfileHeaderProps["user"];
  isFollowing: boolean;
  onFollow?: ProfileHeaderProps["onFollow"];
  onUnfollow?: ProfileHeaderProps["onUnfollow"];
  onEditProfile?: ProfileHeaderProps["onEditProfile"];
  onUserUpdate?: ProfileHeaderProps["onUserUpdate"];
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [mutualModalOpen, setMutualModalOpen] = useState(false);

  const displayName = useMemo(() => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;
  }, [user.firstName, user.lastName, user.username]);

  const joinedDate = useMemo(() => {
    return new Date(user.joinedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }, [user.joinedAt]);

  const handleFollowClick = () => {
    if (isFollowing) {
      onUnfollow?.();
    } else {
      onFollow?.();
    }
  };

  // Handle edit profile modal
  const handleEditProfileClick = () => {
    setIsEditModalOpen(true);
    onEditProfile?.(); // Still call the original callback if provided
  };

  // Handle profile save
  const handleProfileSave = async (data: {
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
  }) => {
    console.log("Saving profile data:", data);

    // Persist changes via backend API
    const updatedProfile = await ProfileService.updateProfile(user.username, {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      bio: data.bio,
      profileImage: data.profileImageUrl,
      coverImage: data.coverImageUrl,
    });

    // Notify parent with updated profile data
    const joinedAt =
      updatedProfile.joinedAt ||
      updatedProfile.createdAt ||
      updatedProfile.updatedAt;

    onUserUpdate?.({
      _id: updatedProfile._id,
      clerkId: updatedProfile.clerkId,
      username: updatedProfile.username,
      email: updatedProfile.email,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      profileImage: updatedProfile.profileImage,
      coverImage: updatedProfile.coverImage,
      bio: updatedProfile.bio,
      joinedAt,
      isVerified: updatedProfile.isVerified,
      followers: updatedProfile.followers,
      following: updatedProfile.following,
      postsCount: updatedProfile.postsCount,
    });
  };

  return {
    displayName,
    joinedDate,
    isEditModalOpen,
    setIsEditModalOpen,
    followersModalOpen,
    setFollowersModalOpen,
    followingModalOpen,
    setFollowingModalOpen,
    mutualModalOpen,
    setMutualModalOpen,
    handleFollowClick,
    handleEditProfileClick,
    handleProfileSave,
  };
}
