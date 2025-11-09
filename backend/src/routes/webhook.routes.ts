import express, { type Request, type Response } from "express";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/express";
import { env } from "../config/env.config.js";
import { User } from "../models/User.model.js";

const router = express.Router();
const webhookSecret = env.CLERK_WEBHOOK_SECRET as string;

// Clerk requires raw body parsing for signature verification
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const headers = req.headers as Record<string, string>;

      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(payload, headers) as WebhookEvent;
      const eventType = evt.type;

      console.log(`📦 Clerk Webhook Received: ${eventType}`);

      switch (eventType) {
        case "user.created": {
          const email = evt.data.email_addresses?.[0]?.email_address;
          const username = evt.data.username || email?.split("@")[0] || "user";
          const profileImage =
            evt.data.image_url ||
            `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100) + 1}`;

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

          await User.findOneAndUpdate(
            { clerkId: evt.data.id },
            { username, email, profileImage },
            { new: true }
          );

          console.log("✅ User updated in MongoDB");
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
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }
  }
);

export default router;
