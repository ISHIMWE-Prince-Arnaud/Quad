import { Button } from "@/components/ui/button";
import type { UserCardData } from "@/components/user/UserCard";

export function FollowersModalFooter({
  isLoading,
  users,
  totalCount,
  type,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: {
  isLoading: boolean;
  users: UserCardData[];
  totalCount: number;
  type: "followers" | "following";
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading || users.length === 0) return null;

  return (
    <div className="px-5 py-4 border-t bg-muted/20 flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {`${users.length} of ${totalCount || users.length} ${type}`}
      </p>

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="rounded-full border-border/70 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
          {isLoadingMore ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
