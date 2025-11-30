import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { useAuthStore } from "@/stores/authStore";
import { ProfileService } from "@/services/profileService";
import { SearchService } from "@/services/searchService";
import type { ContentItem, ApiProfile } from "@/types/api";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

interface EngagementSummary {
  posts: {
    total: number;
    reactions: number;
    comments: number;
  };
  stories: {
    total: number;
    views: number;
  };
  polls: {
    total: number;
    votes: number;
  };
}

function computeEngagement(content: {
  posts: ContentItem[];
  stories: ContentItem[];
  polls: ContentItem[];
}): EngagementSummary {
  const postsTotal = content.posts.length;
  const storiesTotal = content.stories.length;
  const pollsTotal = content.polls.length;

  const postsReactions = content.posts.reduce(
    (sum, item) => sum + (item.reactionsCount || 0),
    0
  );
  const postsComments = content.posts.reduce(
    (sum, item) => sum + (item.commentsCount || 0),
    0
  );

  const storiesViews = content.stories.reduce(
    (sum, item) => sum + (item.views || 0),
    0
  );

  const pollsVotes = content.polls.reduce(
    (sum, item) => sum + (item.totalVotes || 0),
    0
  );

  return {
    posts: {
      total: postsTotal,
      reactions: postsReactions,
      comments: postsComments,
    },
    stories: { total: storiesTotal, views: storiesViews },
    polls: { total: pollsTotal, votes: pollsVotes },
  };
}

function groupByMonth(
  items: ContentItem[]
): { label: string; count: number }[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  const entries = Array.from(map.entries()).sort(([a], [b]) =>
    a < b ? -1 : 1
  );
  return entries.slice(-6).map(([key, count]) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    const label = date.toLocaleString(undefined, {
      month: "short",
      year: "2-digit",
    });
    return { label, count };
  });
}

function getTopByEngagement(items: ContentItem[], limit = 3): ContentItem[] {
  return [...items]
    .sort((a, b) => {
      const aScore =
        (a.reactionsCount || 0) + (a.commentsCount || 0) + (a.totalVotes || 0);
      const bScore =
        (b.reactionsCount || 0) + (b.commentsCount || 0) + (b.totalVotes || 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
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
      if (!user?.username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [profileData, postsRes, storiesRes, pollsRes, popular, trending] =
          await Promise.all([
            ProfileService.getProfileByUsername(user.username),
            ProfileService.getUserPosts(user.username, { limit: 200, page: 1 }),
            ProfileService.getUserStories(user.username, {
              limit: 200,
              page: 1,
            }),
            ProfileService.getUserPolls(user.username, { limit: 200, page: 1 }),
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
  }, [user?.username]);

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
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You need to be signed in to view analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="AnalyticsPage">
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          {/* Left column: personal metrics */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {loading && !profile && (
                  <p className="text-muted-foreground">Loading analytics...</p>
                )}
                {error && <p className="text-destructive text-sm">{error}</p>}
                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border p-3 bg-card/60">
                        <p className="text-xs text-muted-foreground mb-1">
                          Posts
                        </p>
                        <p className="text-xl font-semibold">
                          {engagement.posts.total}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {engagement.posts.reactions} reactions ·{" "}
                          {engagement.posts.comments} comments
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 bg-card/60">
                        <p className="text-xs text-muted-foreground mb-1">
                          Stories
                        </p>
                        <p className="text-xl font-semibold">
                          {engagement.stories.total}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {engagement.stories.views} views
                        </p>
                      </div>
                      <div className="rounded-lg border p-3 bg-card/60">
                        <p className="text-xs text-muted-foreground mb-1">
                          Polls
                        </p>
                        <p className="text-xl font-semibold">
                          {engagement.polls.total}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {engagement.polls.votes} votes
                        </p>
                      </div>
                    </div>

                    {profile && (
                      <div className="grid gap-3 rounded-lg border p-3 text-xs sm:grid-cols-3 bg-card/60">
                        <div>
                          <p className="text-muted-foreground mb-0.5">
                            Followers
                          </p>
                          <p className="text-base font-semibold">
                            {profile.followers ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">
                            Following
                          </p>
                          <p className="text-base font-semibold">
                            {profile.following ?? 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5">
                            Mutual follows
                          </p>
                          <p className="text-base font-semibold">
                            {profile.mutualFollows ?? 0}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Posting Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {postsByMonth.length === 0 && (
                  <p className="text-muted-foreground">
                    Not enough data yet to show activity over time.
                  </p>
                )}
                {postsByMonth.length > 0 && (
                  <ul className="space-y-2">
                    {(() => {
                      const max = Math.max(...postsByMonth.map((p) => p.count));
                      return postsByMonth.map((entry) => (
                        <li
                          key={entry.label}
                          className="flex items-center gap-2">
                          <span className="w-14 shrink-0 text-muted-foreground">
                            {entry.label}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${
                                  max > 0 ? (entry.count / max) * 100 : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="w-6 shrink-0 text-right">
                            {entry.count}
                          </span>
                        </li>
                      ));
                    })()}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {topPosts.length === 0 && (
                  <p className="text-muted-foreground">
                    Once you start posting, your best performers will appear
                    here.
                  </p>
                )}
                {topPosts.length > 0 && (
                  <ul className="space-y-2">
                    {topPosts.map((item) => {
                      const engagementScore =
                        (item.reactionsCount || 0) +
                        (item.commentsCount || 0) +
                        (item.totalVotes || 0);
                      const label =
                        item.content || item.text || "Untitled post";
                      return (
                        <li
                          key={item._id}
                          className="flex items-start justify-between gap-3 rounded-md border bg-card/60 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">
                              {label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {timeAgo(item.createdAt)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                            <p>{engagementScore} total interactions</p>
                            <p>
                              {item.reactionsCount || 0} reactions ·{" "}
                              {item.commentsCount || 0} comments
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Polls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {topPolls.length === 0 && (
                  <p className="text-muted-foreground">
                    Create polls to see which questions resonate most.
                  </p>
                )}
                {topPolls.length > 0 && (
                  <ul className="space-y-2">
                    {topPolls.map((item) => {
                      const votes = item.totalVotes || 0;
                      const label =
                        item.question || item.content || "Untitled poll";
                      return (
                        <li
                          key={item._id}
                          className="flex items-start justify-between gap-3 rounded-md border bg-card/60 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium">
                              {label}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {timeAgo(item.createdAt)}
                            </p>
                          </div>
                          <p className="shrink-0 text-[11px] text-muted-foreground">
                            {votes} vote{votes === 1 ? "" : "s"}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: search analytics and quick insights */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Search Trends (Global)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                    Popular searches
                  </p>
                  {popularSearches.length === 0 && (
                    <p className="text-muted-foreground">No data available.</p>
                  )}
                  {popularSearches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term) => (
                        <span
                          key={term}
                          className="rounded-full bg-muted px-3 py-1 text-[11px]">
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                    Trending now
                  </p>
                  {trendingSearches.length === 0 && (
                    <p className="text-muted-foreground">No data available.</p>
                  )}
                  {trendingSearches.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((term) => (
                        <span
                          key={term}
                          className="rounded-full bg-muted px-3 py-1 text-[11px]">
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-muted-foreground">
                  Overview of how you share content across posts, stories, and
                  polls.
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Posts",
                      value: engagement.posts.total,
                      color: "bg-primary",
                    },
                    {
                      label: "Stories",
                      value: engagement.stories.total,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Polls",
                      value: engagement.polls.total,
                      color: "bg-amber-500",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">
                        {row.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", row.color)}
                          style={{
                            width: `${
                              engagement.posts.total +
                                engagement.stories.total +
                                engagement.polls.total >
                              0
                                ? (row.value /
                                    (engagement.posts.total +
                                      engagement.stories.total +
                                      engagement.polls.total)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
