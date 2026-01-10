import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type EngagementSummaryData = {
  posts: { total: number; reactions: number; comments: number };
  stories: { total: number; views: number };
  polls: { total: number; votes: number };
  followers: number;
  following: number;
  avgEngagementPerItem: number;
};

export function EngagementSummaryCard({
  loading,
  error,
  summary,
}: {
  loading: boolean;
  error: string | null;
  summary: EngagementSummaryData | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engagement Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading && <p className="text-muted-foreground">Loading engagement summary...</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && !error && summary && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 bg-card/60">
              <p className="text-xs text-muted-foreground mb-1">Followers</p>
              <p className="text-xl font-semibold">{summary.followers}</p>
            </div>
            <div className="rounded-lg border p-3 bg-card/60">
              <p className="text-xs text-muted-foreground mb-1">Avg engagement / item</p>
              <p className="text-xl font-semibold">
                {Math.round(summary.avgEngagementPerItem * 10) / 10}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
