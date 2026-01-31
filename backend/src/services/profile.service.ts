import mongoose from "mongoose";
import { clerkClient } from "@clerk/express";

import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { ProfileView } from "../models/ProfileView.model.js";

import type {
  PaginationQuerySchemaType,
  UpdateProfileSchemaType,
} from "../schemas/profile.schema.js";
import {
  calculateProfileStats,
  formatUserProfile,
} from "../utils/profile.util.js";
import { propagateUserSnapshotUpdates } from "../utils/userSnapshotPropagation.util.js";
import { findUserByUsername } from "../utils/userLookup.util.js";
import { getPaginatedData } from "../utils/pagination.util.js";
import { AppError } from "../utils/appError.util.js";
import { logger } from "../utils/logger.util.js";

function isMongoDuplicateKeyError(error: unknown): error is {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export class ProfileService {
  static async ensureUserByClerkId(clerkId: string | null) {
    if (!clerkId) return null;

    const existing = await User.findOne({ clerkId });
    if (existing) return existing;

    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const fallbackUsername = email ? email.split("@")[0] : "Anonymous";

      const createData: Record<string, unknown> = {
        clerkId,
        username: clerkUser.username || fallbackUsername,
        email,
      };

      if (clerkUser.firstName) createData.firstName = clerkUser.firstName;
      if (clerkUser.lastName) createData.lastName = clerkUser.lastName;
      if (clerkUser.imageUrl) createData.profileImage = clerkUser.imageUrl;

      return await User.create(createData);
    } catch (error) {
      logger.error("Failed to ensure user by Clerk ID", error);
      return null;
    }
  }

  static async trackProfileView(profileId: string, viewerId: string | null) {
    if (!viewerId) return;
    if (viewerId === profileId) return;

    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await ProfileView.findOne({
      profileId,
      viewerId,
      createdAt: { $gte: cutoff },
    })
      .select("_id")
      .lean();

    if (!recent) {
      await ProfileView.create({ profileId, viewerId });
    }
  }

  static async getProfileById(userId: string, currentUserId: string | null) {
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await ProfileService.ensureUserByClerkId(userId ?? null);
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await ProfileService.trackProfileView(user.clerkId, currentUserId);

    const stats = await calculateProfileStats(user.clerkId);
    return formatUserProfile(user, stats);
  }

  static async getProfileByUsername(
    username: string,
    currentUserId: string | null,
  ) {
    if (currentUserId) {
      await ProfileService.ensureUserByClerkId(currentUserId);
    }

    const user = await findUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isOwnProfile = user.clerkId === currentUserId;
    await ProfileService.trackProfileView(user.clerkId, currentUserId);

    const stats = await calculateProfileStats(user.clerkId);
    const profile = formatUserProfile(user, stats);

    return {
      profile,
      isOwnProfile,
    };
  }

  static async updateProfile(
    username: string,
    currentUserId: string,
    updates: UpdateProfileSchemaType,
  ) {
    const userToUpdate = await findUserByUsername(username);
    if (!userToUpdate) {
      throw new AppError("User not found", 404);
    }

    if (userToUpdate.clerkId !== currentUserId) {
      throw new AppError(
        "Forbidden: You can only update your own profile",
        403,
      );
    }

    const updateOps: {
      $set: Record<string, unknown>;
    } = { $set: updates as Record<string, unknown> };
    if (updates.username && updates.username !== userToUpdate.username) {
      const existing = await User.findOne({ username: updates.username })
        .select("clerkId")
        .lean();
      if (existing && existing.clerkId !== currentUserId) {
        throw new AppError("Username already taken", 409);
      }
    }

    let user: typeof userToUpdate | null = null;

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      user = await User.findOneAndUpdate(
        { clerkId: currentUserId },
        updateOps,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!user) {
        await session.abortTransaction();
        throw new AppError("User not found", 404);
      }

      const propagationResult = await propagateUserSnapshotUpdates(
        {
          clerkId: user.clerkId,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          coverImage: user.coverImage,
          bio: user.bio,
        },
        { session },
      );

      await session.commitTransaction();

      logger.info("Propagated user snapshot updates after updateProfile", {
        clerkId: user.clerkId,
        ...propagationResult,
      });
    } catch (propagationError: unknown) {
      try {
        await session.abortTransaction();
      } catch {
        // ignore
      }

      if (isMongoDuplicateKeyError(propagationError)) {
        const keyPattern = propagationError.keyPattern || {};
        if ("username" in keyPattern) {
          throw new AppError("Username already taken", 409);
        }
        if ("email" in keyPattern) {
          throw new AppError("Email already taken", 409);
        }

        throw new AppError("Duplicate key error", 409);
      }

      const msg =
        propagationError instanceof Error ? propagationError.message : "";
      const isTxnUnsupported =
        msg.includes("Transaction") &&
        (msg.includes("replica set") ||
          msg.includes("mongos") ||
          msg.includes("not supported"));

      if (!isTxnUnsupported) {
        if (propagationError instanceof AppError) {
          throw propagationError;
        }

        logger.error(
          "Failed to propagate user snapshot updates after updateProfile",
          propagationError,
        );
        throw new AppError("Failed to update user snapshots", 500);
      }

      logger.warn(
        "Transactions not supported; falling back to awaited non-transactional snapshot propagation",
        { clerkId: currentUserId },
      );

      user = await User.findOneAndUpdate(
        { clerkId: currentUserId },
        updateOps,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const propagationResult = await propagateUserSnapshotUpdates({
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
      });

      logger.info(
        "Propagated user snapshot updates after updateProfile (no transaction)",
        {
          clerkId: user.clerkId,
          ...propagationResult,
        },
      );
    } finally {
      session.endSession();
    }

    try {
      await clerkClient.users.updateUser(currentUserId, {
        firstName: updates.firstName ?? undefined,
        lastName: updates.lastName ?? undefined,
        username: updates.username ?? undefined,
        imageUrl:
          updates.profileImage === null
            ? null
            : (updates.profileImage ?? undefined),
      } as unknown as Parameters<typeof clerkClient.users.updateUser>[1]);
    } catch (clerkError) {
      logger.error("Failed to sync profile updates to Clerk", clerkError);
    }

    const stats = await calculateProfileStats(user.clerkId);
    const profile = formatUserProfile(user, stats);

    return profile;
  }

  static async getUserPosts(
    username: string,
    currentUserId: string | null,
    query: PaginationQuerySchemaType,
  ) {
    if (currentUserId) {
      await ProfileService.ensureUserByClerkId(currentUserId);
    }

    const user = await findUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return getPaginatedData(Post, { "author.clerkId": user.clerkId }, query);
  }

  static async getUserStories(
    username: string,
    currentUserId: string | null,
    query: PaginationQuerySchemaType,
  ) {
    if (currentUserId) {
      await ProfileService.ensureUserByClerkId(currentUserId);
    }

    const user = await findUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return getPaginatedData(Story, { "author.clerkId": user.clerkId }, query);
  }

  static async getUserPolls(
    username: string,
    currentUserId: string | null,
    query: PaginationQuerySchemaType,
  ) {
    if (currentUserId) {
      await ProfileService.ensureUserByClerkId(currentUserId);
    }

    const user = await findUserByUsername(username);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return getPaginatedData(Poll, { "author.clerkId": user.clerkId }, query);
  }
}
