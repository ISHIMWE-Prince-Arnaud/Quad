import { Users } from "lucide-react";
import { UserCard, type UserCardData } from "@/components/user/UserCard";
import {
  SkeletonAvatar,
  SkeletonBlock,
  SkeletonLine,
} from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export function FollowersModalBody({
  isLoading,
  users,
  type,
  onFollow,
  onUnfollow,
}: {
  isLoading: boolean;
  users: UserCardData[];
  type: "followers" | "following";
  onFollow: (targetUserId: string) => void;
  onUnfollow: (targetUserId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <SkeletonAvatar className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-4 w-32" />
                <SkeletonLine className="h-3 w-24" />
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length > 0) {
    return (
      <div className="divide-y divide-border/60">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            compact={true}
            showBio={true}
            showStats={false}
            className="border-0 rounded-none transition-colors hover:bg-muted/35"
          />
        ))}
      </div>
    );
  }

  return (
    <EmptyState
      variant="inline"
      icon={<Users className="h-7 w-7" />}
      title={type === "followers" ? "No followers yet" : "Not following anyone"}
      description={
        type === "followers"
          ? "When people follow this user, they’ll appear here."
          : "When this user follows people, they’ll appear here."
      }
      className="py-8"
    />
  );
}
