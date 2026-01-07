import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentItem } from "@/types/api";
import { timeAgo } from "@/lib/timeUtils";

export function AnalyticsTopPollsCard({ topPolls }: { topPolls: ContentItem[] }) {
  return (
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
              const label = item.question || item.content || "Untitled poll";
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
  );
}
