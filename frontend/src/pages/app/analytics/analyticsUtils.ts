import type { ContentItem } from "@/types/api";

import type { AnalyticsContent, EngagementSummary, MonthCount } from "./types";

export function computeEngagement(content: AnalyticsContent): EngagementSummary {
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

export function groupByMonth(items: ContentItem[]): MonthCount[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  const entries = Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
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

export function getTopByEngagement(items: ContentItem[], limit = 3): ContentItem[] {
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
