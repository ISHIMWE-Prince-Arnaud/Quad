import { useEffect, useState } from "react";

import { ProfileService } from "@/services/profileService";
import { SearchService } from "@/services/searchService";
import type { ApiProfile, ContentItem } from "@/types/api";

export function useAnalyticsData({ username }: { username: string | undefined }) {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [stories, setStories] = useState<ContentItem[]>([]);
  const [polls, setPolls] = useState<ContentItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
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

        const [profileData, postsRes, storiesRes, pollsRes, popular, trending] =
          await Promise.all([
            ProfileService.getProfileByUsername(username),
            ProfileService.getUserPosts(username, { limit: 200, page: 1 }),
            ProfileService.getUserStories(username, { limit: 200, page: 1 }),
            ProfileService.getUserPolls(username, { limit: 200, page: 1 }),
            SearchService.getPopularSearches("global", 8).catch(() => []),
            SearchService.getTrendingSearches("global", 8).catch(() => []),
          ]);

        if (cancelled) return;

        setProfile(profileData);
        setPosts(postsRes.posts as ContentItem[]);
        setStories(storiesRes.stories as ContentItem[]);
        setPolls(pollsRes.polls as ContentItem[]);
        setPopularSearches(popular);
        setTrendingSearches(trending);
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
    loading,
    error,
  };
}
