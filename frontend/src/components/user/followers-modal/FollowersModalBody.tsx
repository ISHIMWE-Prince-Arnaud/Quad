import { Search, Users } from "lucide-react";

import { UserCard, type UserCardData } from "@/components/user/UserCard";

export function FollowersModalBody({
  isLoading,
  filteredUsers,
  searchQuery,
  type,
  onFollow,
  onUnfollow,
}: {
  isLoading: boolean;
  filteredUsers: UserCardData[];
  searchQuery: string;
  type: "followers" | "following" | "mutual";
  onFollow: (targetUserId: string) => void;
  onUnfollow: (targetUserId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredUsers.length > 0) {
    return (
      <div className="divide-y">
        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            compact={true}
            showBio={true}
            showStats={false}
            className="border-0 rounded-none hover:bg-accent/50"
          />
        ))}
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
        <Search className="h-8 w-8" />
        <div className="text-center">
          <p className="font-medium">No results found</p>
          <p className="text-sm">Try searching with different keywords</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
      <Users className="h-8 w-8" />
      <div className="text-center">
        <p className="font-medium">
          {type === "followers"
            ? "No followers yet"
            : type === "following"
              ? "No following yet"
              : "No mutual connections yet"}
        </p>
        <p className="text-sm">
          {type === "followers"
            ? "When people follow this user, they will appear here"
            : type === "following"
              ? "When this user follows people, they will appear here"
              : "When you share connections with this user, they will appear here"}
        </p>
      </div>
    </div>
  );
}
