import cron from "node-cron";
import { Poll } from "../models/Poll.model.js";
import { getSocketIO } from "../config/socket.config.js";
import { createNotification, generateNotificationMessage } from "../utils/notification.util.js";

/**
 * Cron job to check for expired polls and update their status
 * Runs every 5 minutes
 * 
 * This automatically marks active polls as expired when their expiresAt date has passed
 */
export const startPollExpiryJob = () => {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("🔍 Checking for expired polls...");

      // Find all active polls that have passed their expiration date
      const expiredPolls = await Poll.find({
        status: "active",
        expiresAt: { $lte: new Date() },
      });

      if (expiredPolls.length === 0) {
        console.log("✅ No polls to expire");
        return;
      }

      // Update all expired polls to 'expired' status
      const updateResult = await Poll.updateMany(
        {
          status: "active",
          expiresAt: { $lte: new Date() },
        },
        {
          $set: { status: "expired" },
        }
      );

      console.log(`✅ Marked ${updateResult.modifiedCount} poll(s) as expired`);

      // Emit real-time events and create notifications for each expired poll
      const io = getSocketIO();
      for (const poll of expiredPolls) {
        const pollId = poll._id ? poll._id.toString() : "";
        if (pollId) {
          io.emit("pollExpired", pollId);

          // Create notification for poll owner
          const ownerId = poll.author?.clerkId;
          if (ownerId) {
            await createNotification({
              userId: ownerId,
              type: "poll_expired",
              contentId: pollId,
              contentType: "Poll",
              message: generateNotificationMessage("poll_expired"),
            });
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in poll expiry cron job:", error);
    }
  });

  console.log("⏰ Poll expiry cron job started (runs every 5 minutes)");
};

/**
 * Manual function to check and expire polls
 * Useful for testing or manual triggers
 */
export const expirePolls = async (): Promise<number> => {
  try {
    const result = await Poll.updateMany(
      {
        status: "active",
        expiresAt: { $lte: new Date() },
      },
      {
        $set: { status: "expired" },
      }
    );

    return result.modifiedCount;
  } catch (error) {
    console.error("Error expiring polls:", error);
    throw error;
  }
};
