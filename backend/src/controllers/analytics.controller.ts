import type { Request, Response } from "express";
import { ProfileView } from "../models/ProfileView.model.js";
import { FollowerHistory } from "../models/FollowerHistory.model.js";
import { Post } from "../models/Post.model.js";
import { Story } from "../models/Story.model.js";
import { Poll } from "../models/Poll.model.js";
import { User } from "../models/User.model.js";
import { logger } from "../utils/logger.util.js";
import { getAnalyticsQuerySchema } from "../schemas/analytics.schema.js";

const parseDateRange = (query: any): { from?: Date; to?: Date } => {
  const dateFrom =
    typeof query?.dateFrom === "string" ? new Date(query.dateFrom) : undefined;
  const dateTo =
    typeof query?.dateTo === "string" ? new Date(query.dateTo) : undefined;

  const from = dateFrom && !Number.isNaN(dateFrom.getTime()) ? dateFrom : undefined;
  const to = dateTo && !Number.isNaN(dateTo.getTime()) ? dateTo : undefined;

  const range: { from?: Date; to?: Date } = {};
  if (from) range.from = from;
  if (to) range.to = to;
  return range;
};

export const recordProfileView = async (req: Request, res: Response) => {
  try {
    const viewerId = req.auth.userId;
    const { profileId } = req.body as { profileId?: string };

    if (!profileId) {
      return res.status(400).json({ success: false, message: "profileId is required" });
    }

    if (profileId === viewerId) {
      return res.json({ success: true, data: { recorded: false } });
    }

    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await ProfileView.findOne({ profileId, viewerId, createdAt: { $gte: cutoff } })
      .select("_id")
      .lean();

    if (!recent) {
      await ProfileView.create({ profileId, viewerId });
    }

    return res.json({ success: true, data: { recorded: !recent } });
  } catch (error: any) {
    logger.error("Error recording profile view", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProfileAnalytics = async (req: Request, res: Response) => {
  try {
    const parsed = getAnalyticsQuerySchema.parse(req.query);
    const { profileId } = parsed;

    const targetProfileId = profileId || req.auth.userId;
    const { from, to } = parseDateRange(parsed);

    const match: any = { profileId: targetProfileId };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const [totalViews, uniqueViewers, byDay] = await Promise.all([
      ProfileView.countDocuments(match),
      ProfileView.distinct("viewerId", match).then((ids) => ids.length),
      ProfileView.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.y",
                month: "$_id.m",
                day: "$_id.d",
              },
            },
            count: 1,
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        profileId: targetProfileId,
        totalViews,
        uniqueViewers,
        viewsByDay: byDay,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching profile analytics", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFollowerGrowth = async (req: Request, res: Response) => {
  try {
    const parsed = getAnalyticsQuerySchema.parse(req.query);
    const targetUserId = parsed.profileId || req.auth.userId;
    const { from, to } = parseDateRange(parsed);

    const match: any = { userId: targetUserId };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = from;
      if (to) match.date.$lte = to;
    }

    const history = await FollowerHistory.find(match)
      .sort({ date: 1 })
      .limit(400)
      .lean();

    return res.json({ success: true, data: history });
  } catch (error: any) {
    logger.error("Error fetching follower growth", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEngagementSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;

    const [posts, stories, polls, user] = await Promise.all([
      Post.find({ userId }).select("reactionsCount commentsCount").lean(),
      Story.find({ userId }).select("viewsCount reactionsCount commentsCount").lean(),
      Poll.find({ "author.clerkId": userId }).select("totalVotes reactionsCount commentsCount").lean(),
      User.findOne({ clerkId: userId }).select("followersCount followingCount").lean(),
    ]);

    const postsReactions = posts.reduce((s, p: any) => s + (p.reactionsCount || 0), 0);
    const postsComments = posts.reduce((s, p: any) => s + (p.commentsCount || 0), 0);

    const storiesViews = stories.reduce((s, st: any) => s + (st.viewsCount || 0), 0);

    const pollsVotes = polls.reduce((s, p: any) => s + (p.totalVotes || 0), 0);

    const totalContent = posts.length + stories.length + polls.length;
    const totalEngagement = postsReactions + postsComments + pollsVotes + storiesViews;
    const avgEngagementPerItem = totalContent > 0 ? totalEngagement / totalContent : 0;

    return res.json({
      success: true,
      data: {
        posts: {
          total: posts.length,
          reactions: postsReactions,
          comments: postsComments,
        },
        stories: {
          total: stories.length,
          views: storiesViews,
        },
        polls: {
          total: polls.length,
          votes: pollsVotes,
        },
        followers: user?.followersCount ?? 0,
        following: user?.followingCount ?? 0,
        avgEngagementPerItem,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching engagement summary", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
