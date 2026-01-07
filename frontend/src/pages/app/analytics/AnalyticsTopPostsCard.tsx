import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentItem } from "@/types/api";
import { timeAgo } from "@/lib/timeUtils";

export function AnalyticsTopPostsCard({ topPosts }: { topPosts: ContentItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {topPosts.length === 0 && (
          <p className="text-muted-foreground">
            Once you start posting, your best performers will appear here.
          </p>
        )}
        {topPosts.length > 0 && (
          <ul className="space-y-2">
            {topPosts.map((item) => {
              const engagementScore =
                (item.reactionsCount || 0) +
                (item.commentsCount || 0) +
                (item.totalVotes || 0);
              const label = item.content || item.text || "Untitled post";
              return (
                <li
                  key={item._id}
                  className="flex items-start justify-between gap-3 rounded-md border bg-card/60 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                    <p>{engagementScore} total interactions</p>
                    <p>
                      {item.reactionsCount || 0} reactions · {item.commentsCount || 0} comments
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
