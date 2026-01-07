import { Button } from "@/components/ui/button";
import type { UserCardData } from "@/components/user/UserCard";

export function FollowersModalFooter({
  isLoading,
  filteredUsers,
  totalCount,
  type,
  searchQuery,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: {
  isLoading: boolean;
  filteredUsers: UserCardData[];
  totalCount: number;
  type: "followers" | "following" | "mutual";
  searchQuery: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading || filteredUsers.length === 0) return null;

  return (
    <div className="p-4 border-t bg-muted/30 flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground text-center">
        {searchQuery
          ? `${filteredUsers.length} ${type} matching "${searchQuery}"`
          : `${filteredUsers.length} of ${totalCount || filteredUsers.length} ${type}`}
      </p>

      {hasMore && type !== "mutual" && (
        <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
