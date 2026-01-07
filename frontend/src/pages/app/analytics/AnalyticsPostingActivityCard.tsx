import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { MonthCount } from "./types";

export function AnalyticsPostingActivityCard({ postsByMonth }: { postsByMonth: MonthCount[] }) {
  return (
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
                <li key={entry.label} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-muted-foreground">
                    {entry.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${max > 0 ? (entry.count / max) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right">{entry.count}</span>
                </li>
              ));
            })()}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
