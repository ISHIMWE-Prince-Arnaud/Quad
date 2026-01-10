import cron from "node-cron";
import { User } from "../models/User.model.js";
import { FollowerHistory } from "../models/FollowerHistory.model.js";
import { logger } from "../utils/logger.util.js";

const startOfDayUTC = (d: Date) => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const runFollowerHistorySnapshot = async () => {
  const date = startOfDayUTC(new Date());

  const users = await User.find().select("clerkId followersCount followingCount").lean();

  const ops = users.map((u) => ({
    updateOne: {
      filter: { userId: u.clerkId, date },
      update: {
        $set: {
          followersCount: u.followersCount || 0,
          followingCount: u.followingCount || 0,
          date,
          userId: u.clerkId,
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await FollowerHistory.bulkWrite(ops);
  }

  return { date, users: users.length };
};

export const startAnalyticsCronJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      const result = await runFollowerHistorySnapshot();
      logger.info("Follower history snapshot complete", result);
    } catch (error) {
      logger.error("Follower history snapshot failed", error);
    }
  });
};
