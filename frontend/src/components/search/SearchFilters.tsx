import { Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SortOption = "relevance" | "date" | "popularity";

export interface SearchFiltersState {
  sortBy: SortOption;
  dateFrom?: string;
  dateTo?: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  className?: string;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  className,
}: SearchFiltersProps) {
  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleDateFromChange = (dateFrom: string) => {
    onFiltersChange({ ...filters, dateFrom: dateFrom || undefined });
  };

  const handleDateToChange = (dateTo: string) => {
    onFiltersChange({ ...filters, dateTo: dateTo || undefined });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      sortBy: "relevance",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters =
    filters.sortBy !== "relevance" || filters.dateFrom || filters.dateTo;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort:</span>
            <span className="capitalize">{filters.sortBy}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSortChange("relevance")}>
            <span
              className={cn(
                filters.sortBy === "relevance" && "font-semibold text-primary"
              )}>
              Relevance
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("date")}>
            <span
              className={cn(
                filters.sortBy === "date" && "font-semibold text-primary"
              )}>
              Date (Newest first)
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("popularity")}>
            <span
              className={cn(
                filters.sortBy === "popularity" && "font-semibold text-primary"
              )}>
              Popularity
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Date Range</span>
            {(filters.dateFrom || filters.dateTo) && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-sm">
                From
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => handleDateFromChange(e.target.value)}
                max={filters.dateTo || new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm">
                To
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleDateToChange(e.target.value)}
                min={filters.dateFrom}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground">
          Clear filters
        </Button>
      )}
    </div>
  );
}
