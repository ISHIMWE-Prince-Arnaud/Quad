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
    logger.info("Clerk webhook endpoint hit", {
      path: req.path,
      bodyLength: (req.body as Buffer | undefined)?.length ?? 0,
    });

    try {
      const payload = req.body;
      const headers = req.headers as Record<string, string>;

      if (!webhookSecret) {
        logger.error("CLERK_WEBHOOK_SECRET is missing", {});
        return res.status(500).json({ success: false });
      }

      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(payload, headers) as WebhookEvent;
      const eventType = evt.type;

      logger.info("Clerk webhook received", { eventType });

      switch (eventType) {
        case "user.created": {
          const email = evt.data.email_addresses?.[0]?.email_address;
          const username = evt.data.username || email?.split("@")[0] || "user";
          const firstName = (evt.data as { first_name?: string }).first_name;
          const lastName = (evt.data as { last_name?: string }).last_name;
          const displayName =
            [firstName, lastName].filter(Boolean).join(" ").trim() || username;
          const profileImage =
            evt.data.image_url ||
            `https://avatar.iran.liara.run/public/${
              Math.floor(Math.random() * 100) + 1
            }`;

          await User.create({
            clerkId: evt.data.id,
            username,
            email,
            displayName,
            firstName,
            lastName,
            profileImage,
          });

          logger.info("User created via Clerk webhook", {
            clerkId: evt.data.id,
          });
          break;
        }

        case "user.updated": {
          const email = evt.data.email_addresses?.[0]?.email_address;
          const username = evt.data.username || email?.split("@")[0] || "user";

          const profileImage = evt.data.image_url;
          const firstName = (evt.data as { first_name?: string }).first_name;
          const lastName = (evt.data as { last_name?: string }).last_name;

          const usernameConflict = await User.findOne({ username })
            .select("clerkId")
            .lean();

          const updateOps: Record<string, unknown> = {
            $set: {
              ...(usernameConflict && usernameConflict.clerkId !== evt.data.id
                ? {}
                : { username }),
              email,
              profileImage,
              firstName,
              lastName,
            },
          };

          const session = await mongoose.startSession();
          try {
            session.startTransaction();

            const updatedUser = await User.findOneAndUpdate(
              { clerkId: evt.data.id },
              updateOps,
              { new: true, upsert: true, session },
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
                { session },
              );
            }

            await session.commitTransaction();
          } catch (propagationError: unknown) {
            try {
              await session.abortTransaction();
            } catch {
              // ignore
            }

            const msg =
              propagationError instanceof Error ? propagationError.message : "";
            const isTxnUnsupported =
              msg.includes("Transaction") &&
              (msg.includes("replica set") ||
                msg.includes("mongos") ||
                msg.includes("not supported"));

            if (!isTxnUnsupported) {
              logger.error(
                "Clerk user.updated webhook failed",
                propagationError,
              );
              return res.status(500).json({ success: false });
            }

            logger.warn(
              "Transactions not supported; falling back to awaited non-transactional propagation for Clerk webhook",
              { clerkId: evt.data.id },
            );

            const updatedUser = await User.findOneAndUpdate(
              { clerkId: evt.data.id },
              updateOps,
              { new: true, upsert: true },
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

          logger.info("User updated via Clerk webhook + snapshots propagated", {
            clerkId: evt.data.id,
          });
          break;
        }

        case "user.deleted": {
          const userId = evt.data.id;

          // Cascade delete all user data
          // We use dynamic imports or assume models are available
          const { Post } = await import("../models/Post.model.js");
          const { Story } = await import("../models/Story.model.js");
          const { Poll } = await import("../models/Poll.model.js");
          const { PollVote } = await import("../models/PollVote.model.js");
          const { Reaction } = await import("../models/Reaction.model.js");
          const { ChatMessage } =
            await import("../models/ChatMessage.model.js");
          const { Notification } =
            await import("../models/Notification.model.js");

          // Run these in parallel for speed
          await Promise.all([
            User.findOneAndDelete({ clerkId: userId }),
            Post.deleteMany({ "author.clerkId": userId }),
            Story.deleteMany({ "author.clerkId": userId }),
            Poll.deleteMany({ "author.clerkId": userId }),
            PollVote.deleteMany({ userId }),
            Reaction.deleteMany({ userId }),
            ChatMessage.deleteMany({ "author.clerkId": userId }),
            Notification.deleteMany({ userId }), // Notifications received by user
            Notification.deleteMany({ actorId: userId }), // Notifications triggered by user
          ]);

          logger.info("User and related data deleted via Clerk webhook", {
            clerkId: userId,
          });
          break;
        }

        default:
          logger.info("Unhandled Clerk webhook event", { eventType });
      }

      return res.status(200).json({ success: true });
    } catch (err: unknown) {
      logger.error("Clerk webhook verification failed", {
        message: err instanceof Error ? err.message : undefined,
        name: err instanceof Error ? err.name : undefined,
      });
      const message =
        err instanceof Error ? err.message : "Invalid webhook signature";
      return res
        .status(400)
        .json({ error: "Invalid webhook signature", details: message });
    }
  },
);

export default router;
