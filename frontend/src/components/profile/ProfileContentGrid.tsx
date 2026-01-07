import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type { ContentItem } from "./profile-content-grid/types";
import type { ContentItem } from "./profile-content-grid/types";
import { ContentCard } from "./profile-content-grid/ContentCard";

interface ProfileContentGridProps {
  items: ContentItem[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function ProfileContentGrid({
  items,
  loading = false,
  onLoadMore,
  hasMore = false,
  className,
}: ProfileContentGridProps) {
  const [columns, setColumns] = useState(1);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(3); // xl
      else if (width >= 768) setColumns(2); // md
      else setColumns(1); // sm
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Distribute items into columns for masonry layout
  const distributeItems = (items: ContentItem[], columnCount: number) => {
    const columns: ContentItem[][] = Array.from(
      { length: columnCount },
      () => []
    );

    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(item);
    });

    return columns;
  };

  const itemColumns = distributeItems(items, columns);

  if (loading && items.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium mb-2">No content yet</h3>
          <p className="text-sm">
            When content is created, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Masonry Grid */}
      <div
        className={cn(
          "grid gap-4",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3"
        )}>
        {itemColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {column.map((item) => (
              <ContentCard key={item._id} item={item} />
            ))}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="min-w-[120px]">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
