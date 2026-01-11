import type { RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { OptimisticPostCard } from "@/components/posts/OptimisticPostCard";
import type { FeedItem } from "@/types/feed";
import type { Post } from "@/types/post";

export function FeedList({
  items,
  shouldUseVirtualization,
  parentRef,
  virtualizer,
  onDeletePost,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  items: FeedItem[];
  shouldUseVirtualization: boolean;
  parentRef: RefObject<HTMLDivElement>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  onDeletePost: (postId: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <>
      {shouldUseVirtualization ? (
        <div
          ref={parentRef}
          className="space-y-6"
          style={{
            height: "calc(100vh - 300px)",
            overflow: "auto",
          }}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="pb-6">
                  {item.type === "post" ? (
                    (() => {
                      const post = item.content as Post;
                      const isOptimistic = post._id.startsWith("optimistic:");
                      return isOptimistic ? (
                        <OptimisticPostCard post={post} />
                      ) : (
                        <PostCard post={post} onDelete={onDeletePost} />
                      );
                    })()
                  ) : (
                    <Card className="shadow-sm">
                      <CardContent className="py-6 text-center text-sm text-muted-foreground">
                        {item.type === "poll"
                          ? "Poll item will be shown here in a future phase."
                          : "Story item will be shown here in a future phase."}
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {items.map((item) => {
            if (item.type === "post") {
              const post = item.content as Post;
              const isOptimistic = post._id.startsWith("optimistic:");
              return (
                <>
                  {isOptimistic ? (
                    <OptimisticPostCard key={post._id} post={post} />
                  ) : (
                    <PostCard key={post._id} post={post} onDelete={onDeletePost} />
                  )}
                </>
              );
            }

            return (
              <Card key={String(item._id)} className="shadow-sm">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  {item.type === "poll"
                    ? "Poll item will be shown here in a future phase."
                    : "Story item will be shown here in a future phase."}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </>
  );
}
