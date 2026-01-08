import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/express";
import { env } from "../config/env.config.js";
import { User } from "../models/User.model.js";
import { propagateUserSnapshotUpdates } from "../utils/userSnapshotPropagation.util.js";
import { logger } from "../utils/logger.util.js";

const router = express.Router();
const webhookSecret = env.CLERK_WEBHOOK_SECRET as string;

// Clerk requires raw body parsing for signature verification
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    console.log("🔔 Webhook endpoint hit!");
    console.log("📋 Headers:", req.headers);
    console.log("📦 Body length:", req.body?.length);

    try {
      const payload = req.body;
      const headers = req.headers as Record<string, string>;

      console.log("🔐 Webhook secret:", webhookSecret ? "Present" : "Missing");

      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(payload, headers) as WebhookEvent;
      const eventType = evt.type;

      console.log(`✅ Clerk Webhook Received: ${eventType}`);

      switch (eventType) {
        case "user.created": {
          const email = evt.data.email_addresses?.[0]?.email_address;
          const username = evt.data.username || email?.split("@")[0] || "user";
          const profileImage =
            evt.data.image_url ||
            `https://avatar.iran.liara.run/public/${
              Math.floor(Math.random() * 100) + 1
            }`;

          await User.create({
            clerkId: evt.data.id,
            username,
            email,
            profileImage,
          });

          console.log("✅ User created in MongoDB");
          break;
        }

        case "user.updated": {
          const email = evt.data.email_addresses?.[0]?.email_address;
          const username = evt.data.username || email?.split("@")[0] || "user";

          const profileImage = evt.data.image_url;
          const firstName = (evt.data as any).first_name;
          const lastName = (evt.data as any).last_name;

          const existingUser = await User.findOne({ clerkId: evt.data.id });

          const updateOps: Record<string, any> = {
            $set: {
              username,
              email,
              profileImage,
              firstName,
              lastName,
            },
          };

          if (existingUser && username && username !== existingUser.username) {
            updateOps.$addToSet = { previousUsernames: existingUser.username };
            updateOps.$pull = { previousUsernames: username };
          }

          const session = await mongoose.startSession();
          try {
            session.startTransaction();

            const updatedUser = await User.findOneAndUpdate(
              { clerkId: evt.data.id },
              updateOps,
              { new: true, upsert: true, session }
            );

            if (updatedUser) {
              await propagateUserSnapshotUpdates(
                {
                  clerkId: updatedUser.clerkId,
                  username: updatedUser.username,
                  email: updatedUser.email,
                  displayName: updatedUser.displayName,
                  firstName: updatedUser.firstName,
                  lastName: updatedUser.lastName,
                  profileImage: updatedUser.profileImage,
                  coverImage: updatedUser.coverImage,
                  bio: updatedUser.bio,
                },
                { session }
              );
            }

            await session.commitTransaction();
          } catch (propagationError: any) {
            try {
              await session.abortTransaction();
            } catch {
              // ignore
            }

            const msg =
              typeof propagationError?.message === "string" ? propagationError.message : "";
            const isTxnUnsupported =
              msg.includes("Transaction") &&
              (msg.includes("replica set") ||
                msg.includes("mongos") ||
                msg.includes("not supported"));

            if (!isTxnUnsupported) {
              logger.error("Clerk user.updated webhook failed", propagationError);
              return res.status(500).json({ success: false });
            }

            logger.warn(
              "Transactions not supported; falling back to awaited non-transactional propagation for Clerk webhook",
              { clerkId: evt.data.id }
            );

            const updatedUser = await User.findOneAndUpdate(
              { clerkId: evt.data.id },
              updateOps,
              { new: true, upsert: true }
            );

            if (updatedUser) {
              await propagateUserSnapshotUpdates({
                clerkId: updatedUser.clerkId,
                username: updatedUser.username,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                profileImage: updatedUser.profileImage,
                coverImage: updatedUser.coverImage,
                bio: updatedUser.bio,
              });
            }
          } finally {
            session.endSession();
          }

          console.log("✅ User updated in MongoDB + snapshots propagated");
          break;
        }

        case "user.deleted": {
          await User.findOneAndDelete({ clerkId: evt.data.id });
          console.log("🗑️ User deleted from MongoDB");
          break;
        }

        default:
          console.log("ℹ️ Unhandled event:", eventType);
      }

      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("❌ Webhook verification failed:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      return res
        .status(400)
        .json({ error: "Invalid webhook signature", details: err.message });
    }
  }
);

export default router;
