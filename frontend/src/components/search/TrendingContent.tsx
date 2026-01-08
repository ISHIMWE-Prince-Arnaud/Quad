import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Hash } from "lucide-react";
import { SearchService } from "@/services/searchService";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { logError } from "@/lib/errorHandling";

interface TrendingContentProps {
  searchType?: "users" | "posts" | "stories" | "polls";
  limit?: number;
  className?: string;
}

export function TrendingContent({
  searchType = "users",
  limit = 10,
  className,
}: TrendingContentProps) {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrendingData = async () => {
      try {
        setLoading(true);

        // Load both trending and popular searches
        const [trendingData, popularData] = await Promise.all([
          SearchService.getTrendingSearches(searchType, limit),
          SearchService.getPopularSearches(searchType, Math.min(limit, 5)),
        ]);

        setTrending(trendingData);
        setPopular(popularData);
      } catch (error) {
        logError(error, {
          component: "TrendingContent",
          action: "loadTrendingData",
          metadata: { searchType, limit },
        });
        toast.error("Failed to load trending content");
      } finally {
        setLoading(false);
      }
    };

    loadTrendingData();
  }, [searchType, limit]);

  const handleSearchClick = (query: string) => {
    navigate(`/app/search?q=${encodeURIComponent(query)}&tab=all`);
  };

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">
            Loading trending...
          </div>
        </div>
      </Card>
    );
  }

  const hasTrending = trending.length > 0;
  const hasPopular = popular.length > 0;

  if (!hasTrending && !hasPopular) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No trending content</h3>
          <p className="text-sm text-muted-foreground">
            Check back later for trending searches
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Trending Section */}
      {hasTrending && (
        <div>
          <div className="flex items-center gap-2 p-4 border-b">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Trending Now</h3>
          </div>
          <div className="divide-y">
            {trending.map((query, index) => (
              <button
                key={`trending-${index}`}
                onClick={() => handleSearchClick(query)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{query}</p>
                    <p className="text-xs text-muted-foreground">
                      Trending in {searchType}
                    </p>
                  </div>
                </div>
                <Hash className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Section */}
      {hasPopular && (
        <div className={hasTrending ? "border-t" : ""}>
          <div className="flex items-center gap-2 p-4 border-b">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Popular Searches</h3>
          </div>
          <div className="divide-y">
            {popular.map((query, index) => (
              <button
                key={`popular-${index}`}
                onClick={() => handleSearchClick(query)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors">
                <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{query}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
