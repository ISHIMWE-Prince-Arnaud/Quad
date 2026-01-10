import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileViewsCard({
  loading,
  error,
  totalViews,
  uniqueViewers,
}: {
  loading: boolean;
  error: string | null;
  totalViews: number;
  uniqueViewers: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile Views</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {loading && <p className="text-muted-foreground">Loading profile views...</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 bg-card/60">
              <p className="text-xs text-muted-foreground mb-1">Total views</p>
              <p className="text-xl font-semibold">{totalViews}</p>
            </div>
            <div className="rounded-lg border p-3 bg-card/60">
              <p className="text-xs text-muted-foreground mb-1">Unique viewers</p>
              <p className="text-xl font-semibold">{uniqueViewers}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
