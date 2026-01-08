import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
import type { CreateUserSchemaType, UpdateUserSchemaType } from "../schemas/user.schema.js";
import { logger } from "../utils/logger.util.js";
import { getAuth, clerkClient } from "@clerk/express";
import { propagateUserSnapshotUpdates } from "../utils/userSnapshotPropagation.util.js";

/**
 * =========================
 * CREATE USER
 * =========================
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    // ✅ Get Clerk userId from request
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId });
    if (existingUser) {
      return res.status(200).json({ success: true, data: existingUser });
    }

    // ✅ Optionally fetch user info from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const body = req.body as Partial<CreateUserSchemaType>;

    // ✅ Create new user in MongoDB
    const newUser = await User.create({
      clerkId: userId,
      username: clerkUser.username ?? body.username ?? "Anonymous",
      email: clerkUser.emailAddresses[0]?.emailAddress ?? body.email ?? "",
      profileImage: body.profileImage, // will use default avatar in model if not provided
      bio: body.bio,
    });

    return res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    logger.error("Error creating user", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * =========================
 * GET USER
 * =========================
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // ✅ Only allow access to own user data (or admin logic could be added)
    if (userId !== clerkId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error("Error fetching user", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * =========================
 * UPDATE USER
 * =========================
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // ✅ Only allow updating own profile
    if (userId !== clerkId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updates = req.body as Partial<UpdateUserSchemaType>;
    const { previousUsernames: _ignored, clerkId: _ignoredClerkId, ...safeUpdates } =
      updates as any;

    const existingUser = await User.findOne({ clerkId });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateOps: Record<string, any> = { $set: safeUpdates };
    if (safeUpdates.username && safeUpdates.username !== existingUser.username) {
      updateOps.$addToSet = { previousUsernames: existingUser.username };
      updateOps.$pull = { previousUsernames: safeUpdates.username };
    }

    const updatedUser = await User.findOneAndUpdate({ clerkId }, updateOps, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    void propagateUserSnapshotUpdates({
      clerkId: updatedUser.clerkId,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profileImage: updatedUser.profileImage,
      coverImage: updatedUser.coverImage,
      bio: updatedUser.bio,
    })
      .then((result) => {
        logger.info("Propagated user snapshot updates after updateUser", {
          clerkId: updatedUser.clerkId,
          ...result,
        });
      })
      .catch((propagationError) => {
        logger.error("Failed to propagate user snapshot updates after updateUser", propagationError);
      });

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    logger.error("Error updating user", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * =========================
 * DELETE USER
 * =========================
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { clerkId } = req.params;
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    // ✅ Only allow deleting own account
    if (userId !== clerkId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const deletedUser = await User.findOneAndDelete({ clerkId });

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    logger.error("Error deleting user", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
