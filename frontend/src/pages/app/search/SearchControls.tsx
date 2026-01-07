import { Calendar, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SortKey, TabKey } from "./searchTypes";

export function SearchControls({
  tab,
  sort,
  dateFrom,
  dateTo,
  showFilters,
  onTabChange,
  onToggleFilters,
  onSortChange,
  onDateFromChange,
  onDateToChange,
}: {
  tab: TabKey;
  sort: SortKey;
  dateFrom: string;
  dateTo: string;
  showFilters: boolean;
  onTabChange: (tab: TabKey) => void;
  onToggleFilters: () => void;
  onSortChange: (sort: SortKey) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}) {
  return (
    <>
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {(["all", "users", "posts", "stories", "polls"] as TabKey[]).map(
            (key) => (
              <Button
                key={key}
                variant={tab === key ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(key)}
                className="rounded-full capitalize">
                {key}
              </Button>
            )
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={`gap-2 ${showFilters ? "bg-secondary" : ""}`}>
          <Filter className="h-3.5 w-3.5" />
          Filters
          {(sort !== "relevance" || dateFrom) && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2 md:grid-cols-4 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-xs font-medium">Sort By</label>
            <div className="flex flex-wrap gap-2">
              {(["relevance", "date", "popularity"] as SortKey[]).map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant={sort === key ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 text-xs capitalize"
                  onClick={() => onSortChange(key)}>
                  {key}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2 md:col-span-2">
            <label className="text-xs font-medium">Date Range</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="h-8 w-full rounded-md border bg-background pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <span className="text-xs text-muted-foreground">to</span>
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="h-8 w-full rounded-md border bg-background pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
