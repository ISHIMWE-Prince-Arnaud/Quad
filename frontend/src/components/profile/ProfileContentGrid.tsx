import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { PiTrayBold } from "react-icons/pi";
import { cn } from "@/lib/utils";

export type { ContentItem } from "./profile-content-grid/types";
import type { ContentItem } from "./profile-content-grid/types";
import { ContentCard } from "./profile-content-grid/ContentCard";
import { InfiniteScrollLoader } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280)
        setColumns(3); // xl
      else if (width >= 768)
        setColumns(2); // md
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
      () => [],
    );

    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(item);
    });

    return columns;
  };

  const itemColumns = distributeItems(items, columns);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    if (!hasMore || loading || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

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
      <EmptyState
        icon={<PiTrayBold className="h-8 w-8" />}
        title="No content yet"
        description="When content is created or saved, it will appear here in your profile."
        className={className}
      />
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
          columns === 3 && "grid-cols-3",
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
        <div className="relative">
          <div
            ref={loadMoreRef}
            className="absolute bottom-40 w-full h-10 pointer-events-none"
          />
          {loading && <InfiniteScrollLoader />}
        </div>
      )}
    </div>
  );
}
