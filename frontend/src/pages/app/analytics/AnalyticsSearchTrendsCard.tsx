import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsSearchTrendsCard({
  popularSearches,
  trendingSearches,
}: {
  popularSearches: string[];
  trendingSearches: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Search Trends (Global)</CardTitle>
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
  );
}
