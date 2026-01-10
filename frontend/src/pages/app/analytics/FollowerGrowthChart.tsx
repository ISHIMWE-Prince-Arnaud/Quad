import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FollowerGrowthPoint = {
  date: string;
  followersCount: number;
  followingCount: number;
};

export function FollowerGrowthChart({
  loading,
  error,
  history,
}: {
  loading: boolean;
  error: string | null;
  history: FollowerGrowthPoint[];
}) {
  const points = history.slice(-14);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Follower Growth</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {loading && <p className="text-muted-foreground">Loading follower growth...</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && !error && points.length === 0 && (
          <p className="text-muted-foreground">Not enough data yet to show growth.</p>
        )}
        {!loading && !error && points.length > 0 && (
          <ul className="space-y-2">
            {(() => {
              const max = Math.max(...points.map((p) => p.followersCount));
              return points.map((p) => {
                const label = new Date(p.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                });
                return (
                  <li key={p.date} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-muted-foreground">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${max > 0 ? (p.followersCount / max) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right">{p.followersCount}</span>
                  </li>
                );
              });
            })()}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
