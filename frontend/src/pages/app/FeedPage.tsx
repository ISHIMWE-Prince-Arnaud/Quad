import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { PageTransition } from "@/components/ui/page-transition";
import type { FeedTab, FeedType } from "@/types/feed";
import { emptyStateCopy } from "./feed/feedEmptyState";
import { FeedHeaderTabs } from "./feed/FeedHeaderTabs";
import { FeedList } from "./feed/FeedList";
import { FeedStatusCards } from "./feed/FeedStatusCards";
import { useFeedController } from "./feed/useFeedController";

import { FeedPostComposer } from "./feed/FeedPostComposer";

export default function FeedPage() {
  const [feedType, setFeedType] = useState<FeedType>("foryou");
  const [tab, setTab] = useState<FeedTab>("home");

  const {
    items,
    hasMore,
    loading,
    loadingMore,
    creatingPost,
    error,
    handleRefreshFeed,
    handleLoadMore,
    handleDeletePost,
    handleDeletePoll,
    handleCreatePost,
  } = useFeedController({ feedType, tab });

  const currentEmptyState = emptyStateCopy[tab];
  const parentRef = useRef<HTMLDivElement>(null!);
  const shouldUseVirtualization = items.length >= 100;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 3,
    enabled: shouldUseVirtualization,
  });

  return (
    <ComponentErrorBoundary>
      <PageTransition>
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
          <div className="space-y-6">
            <FeedHeaderTabs
              feedType={feedType}
              tab={tab}
              onFeedTypeChange={setFeedType}
              onTabChange={setTab}
            />

            <FeedPostComposer
              disabled={loading || creatingPost}
              onCreatePost={handleCreatePost}
            />

            <FeedStatusCards
              loading={loading}
              error={error}
              itemsLength={items.length}
              emptyState={currentEmptyState}
              onRetry={() => void handleRefreshFeed()}
            />

            {!loading && !error && items.length > 0 && (
              <FeedList
                items={items}
                shouldUseVirtualization={shouldUseVirtualization}
                parentRef={parentRef}
                virtualizer={virtualizer}
                onDeletePost={handleDeletePost}
                onDeletePoll={handleDeletePoll}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={() => void handleLoadMore()}
              />
            )}
          </div>
        </div>
      </PageTransition>
    </ComponentErrorBoundary>
  );
}
