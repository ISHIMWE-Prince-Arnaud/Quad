import { endpoints } from "@/lib/api";

export type ProfileViewsByDay = { date: string; count: number };

export type ProfileAnalyticsResponse = {
  profileId: string;
  totalViews: number;
  uniqueViewers: number;
  viewsByDay: ProfileViewsByDay[];
};

export type FollowerHistoryPoint = {
  userId: string;
  followersCount: number;
  followingCount: number;
  date: string;
};

export type EngagementSummaryResponse = {
  posts: { total: number; reactions: number; comments: number };
  stories: { total: number; views: number };
  polls: { total: number; votes: number };
  followers: number;
  following: number;
  avgEngagementPerItem: number;
};

export type ContentAnalyticsResponse = {
  posts?: {
    count: number;
    totals: { reactions: number; comments: number };
  };
  stories?: {
    count: number;
    totals: { views: number; reactions: number; comments: number };
  };
  polls?: {
    count: number;
    totals: { votes: number; reactions: number; comments: number };
  };
};

export class AnalyticsService {
  static async getProfileAnalytics(params?: { dateFrom?: string; dateTo?: string }) {
    const res = await endpoints.analytics.profile(params);
    return res.data as { success: boolean; data: ProfileAnalyticsResponse };
  }

  static async getFollowerGrowth(params?: { dateFrom?: string; dateTo?: string }) {
    const res = await endpoints.analytics.followers(params);
    return res.data as { success: boolean; data: FollowerHistoryPoint[] };
  }

  static async getEngagementSummary() {
    const res = await endpoints.analytics.summary();
    return res.data as { success: boolean; data: EngagementSummaryResponse };
  }

  static async getContentAnalytics(params?: {
    contentType?: "post" | "story" | "poll";
  }) {
    const res = await endpoints.analytics.content(params);
    return res.data as { success: boolean; data: ContentAnalyticsResponse };
  }

  static async recordProfileView(profileId: string) {
    const res = await endpoints.analytics.recordProfileView({ profileId });
    return res.data as { success: boolean; data: { recorded: boolean } };
  }
}
