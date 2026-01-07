import { Clock, MoreHorizontal, TrendingUp, X } from "lucide-react";
import type { MouseEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchHistoryItem } from "@/services/searchService";

export function SearchSidebar({
  history,
  trending,
  popular,
  onClearHistory,
  onDeleteHistoryItem,
  onSelectQuery,
}: {
  history: SearchHistoryItem[];
  trending: string[];
  popular: string[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string, e: MouseEvent) => void;
  onSelectQuery: (query: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="sticky top-6 space-y-6">
        {/* History */}
        {history.length > 0 && (
          <Card className="shadow-none border-dashed">
            <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </CardTitle>
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => void onClearHistory()}>
                Clear all
              </Button>
            </CardHeader>
            <CardContent className="py-2">
              <ul className="space-y-1">
                {history.map((h) => (
                  <li
                    key={h._id}
                    className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                    <button
                      type="button"
                      onClick={() => onSelectQuery(h.query)}
                      className="flex-1 text-left text-sm truncate">
                      {h.query}
                    </button>
                    <button
                      onClick={(e) => onDeleteHistoryItem(h._id, e)}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Trending */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {trending.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No trending topics
                </span>
              )}
              {trending.map((term) => (
                <Badge
                  key={term}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => onSelectQuery(term)}>
                  #{term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Popular
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {popular.map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                  onClick={() => onSelectQuery(term)}>
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
