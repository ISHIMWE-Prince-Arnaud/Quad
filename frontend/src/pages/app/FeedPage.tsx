import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { PageTransition } from "@/components/ui/page-transition";
import type { FeedTab, FeedType } from "@/types/feed";
import { emptyStateCopy } from "./feed/feedEmptyState";
import { FeedHeaderTabs } from "./feed/FeedHeaderTabs";
import { FeedList } from "./feed/FeedList";
import { FeedNewContentBanner } from "./feed/FeedNewContentBanner";
import { FeedStatusCards } from "./feed/FeedStatusCards";
import { useFeedController } from "./feed/useFeedController";

export default function FeedPage() {
  const [feedType, setFeedType] = useState<FeedType>("foryou");
  const [tab, setTab] = useState<FeedTab>("home");

  const {
    items,
    hasMore,
    loading,
    loadingMore,
    error,
    newCount,
    handleRefreshFeed,
    handleLoadMore,
    handleDeletePost,
  } = useFeedController({ feedType, tab });

  const currentEmptyState = emptyStateCopy[tab];

  const parentRef = useRef<HTMLDivElement>(null!);

  // Virtual scrolling setup - only enable for lists with 100+ items
  const shouldUseVirtualization = items.length >= 100;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated feed item height
    overscan: 3, // Render 3 extra items above and below viewport
    enabled: shouldUseVirtualization,
  });

  return (
    <ComponentErrorBoundary>
      <PageTransition>
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          <FeedHeaderTabs
            feedType={feedType}
            tab={tab}
            onFeedTypeChange={setFeedType}
            onTabChange={setTab}
          />

          <FeedNewContentBanner
            newCount={newCount}
            loading={loading}
            onRefresh={handleRefreshFeed}
          />

          <FeedStatusCards
            loading={loading}
            error={error}
            itemsLength={items.length}
            emptyState={currentEmptyState}
          />

          {!loading && !error && items.length > 0 && (
            <FeedList
              items={items}
              shouldUseVirtualization={shouldUseVirtualization}
              parentRef={parentRef}
              virtualizer={virtualizer}
              onDeletePost={handleDeletePost}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={() => void handleLoadMore()}
            />
          )}
        </div>
      </PageTransition>
    </ComponentErrorBoundary>
  );
}
