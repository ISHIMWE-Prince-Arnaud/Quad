import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { useAuthStore } from "@/stores/authStore";
import { AnalyticsAuthRequiredCard } from "./analytics/AnalyticsAuthRequiredCard";
import { AnalyticsContentMixCard } from "./analytics/AnalyticsContentMixCard";
import { AnalyticsOverviewCard } from "./analytics/AnalyticsOverviewCard";
import { AnalyticsPostingActivityCard } from "./analytics/AnalyticsPostingActivityCard";
import { AnalyticsSearchTrendsCard } from "./analytics/AnalyticsSearchTrendsCard";
import { AnalyticsTopPollsCard } from "./analytics/AnalyticsTopPollsCard";
import { AnalyticsTopPostsCard } from "./analytics/AnalyticsTopPostsCard";
import {
  computeEngagement,
  getTopByEngagement,
  groupByMonth,
} from "./analytics/analyticsUtils";
import { useAnalyticsData } from "./analytics/useAnalyticsData";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const {
    profile,
    posts,
    stories,
    polls,
    popularSearches,
    trendingSearches,
    loading,
    error,
  } = useAnalyticsData({ username: user?.username });

  const engagement = useMemo(
    () => computeEngagement({ posts, stories, polls }),
    [posts, stories, polls]
  );

  const postsByMonth = useMemo(() => groupByMonth(posts), [posts]);

  const topPosts = useMemo(() => getTopByEngagement(posts, 3), [posts]);
  const topPolls = useMemo(() => getTopByEngagement(polls, 3), [polls]);

  if (!user?.username) {
    return (
      <ComponentErrorBoundary componentName="AnalyticsPage">
        <AnalyticsAuthRequiredCard />
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="AnalyticsPage">
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* Left column: personal metrics */}
          <div className="space-y-4">
            <AnalyticsOverviewCard
              loading={loading}
              error={error}
              profile={profile}
              engagement={engagement}
            />

            <AnalyticsPostingActivityCard postsByMonth={postsByMonth} />

            <AnalyticsTopPostsCard topPosts={topPosts} />

            <AnalyticsTopPollsCard topPolls={topPolls} />
          </div>

          {/* Right column: search analytics and quick insights */}
          <div className="space-y-4">
            <AnalyticsSearchTrendsCard
              popularSearches={popularSearches}
              trendingSearches={trendingSearches}
            />

            <AnalyticsContentMixCard engagement={engagement} />
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
