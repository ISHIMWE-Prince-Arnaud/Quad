import { useEffect, useState } from "react";

import { ProfileService } from "@/services/profileService";
import { SearchService } from "@/services/searchService";
import { AnalyticsService } from "@/services/analyticsService";
import type { ApiProfile, ContentItem } from "@/types/api";

export function useAnalyticsData({ username }: { username: string | undefined }) {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [stories, setStories] = useState<ContentItem[]>([]);
  const [polls, setPolls] = useState<ContentItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [profileViews, setProfileViews] = useState<{
    totalViews: number;
    uniqueViewers: number;
  } | null>(null);
  const [followerHistory, setFollowerHistory] = useState<
    { date: string; followersCount: number; followingCount: number }[]
  >([]);
  const [engagementSummary, setEngagementSummary] = useState<{
    posts: { total: number; reactions: number; comments: number };
    stories: { total: number; views: number };
    polls: { total: number; votes: number };
    followers: number;
    following: number;
    avgEngagementPerItem: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          profileData,
          postsRes,
          storiesRes,
          pollsRes,
          popular,
          trending,
          profileAnalytics,
          followerGrowth,
          summary,
        ] = await Promise.all([
          ProfileService.getProfileByUsername(username),
          ProfileService.getUserPosts(username, { limit: 200, page: 1 }),
          ProfileService.getUserStories(username, { limit: 200, page: 1 }),
          ProfileService.getUserPolls(username, { limit: 200, page: 1 }),
          SearchService.getPopularSearches("global", 8).catch(() => []),
          SearchService.getTrendingSearches("global", 8).catch(() => []),
          AnalyticsService.getProfileAnalytics().catch(() => ({
            success: true,
            data: { profileId: "", totalViews: 0, uniqueViewers: 0, viewsByDay: [] },
          })),
          AnalyticsService.getFollowerGrowth().catch(() => ({ success: true, data: [] })),
          AnalyticsService.getEngagementSummary().catch(() => ({
            success: true,
            data: {
              posts: { total: 0, reactions: 0, comments: 0 },
              stories: { total: 0, views: 0 },
              polls: { total: 0, votes: 0 },
              followers: 0,
              following: 0,
              avgEngagementPerItem: 0,
            },
          })),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setPosts(postsRes.posts as ContentItem[]);
        setStories(storiesRes.stories as ContentItem[]);
        setPolls(pollsRes.polls as ContentItem[]);
        setPopularSearches(popular);
        setTrendingSearches(trending);
        setProfileViews({
          totalViews: profileAnalytics.data.totalViews,
          uniqueViewers: profileAnalytics.data.uniqueViewers,
        });
        setFollowerHistory(
          (followerGrowth.data || []).map((p) => ({
            date: p.date,
            followersCount: p.followersCount,
            followingCount: p.followingCount,
          }))
        );
        setEngagementSummary(summary.data);
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Failed to load analytics. Please try again.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return {
    profile,
    posts,
    stories,
    polls,
    popularSearches,
    trendingSearches,
    profileViews,
    followerHistory,
    engagementSummary,
    loading,
    error,
  };
}
