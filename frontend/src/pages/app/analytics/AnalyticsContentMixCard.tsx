import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { EngagementSummary } from "./types";

export function AnalyticsContentMixCard({ engagement }: { engagement: EngagementSummary }) {
  const total =
    engagement.posts.total + engagement.stories.total + engagement.polls.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content Mix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-muted-foreground">
          Overview of how you share content across posts, stories, and polls.
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
                    width: `${total > 0 ? (row.value / total) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
