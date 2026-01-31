import { Users } from "lucide-react";

import { UserCard, type UserCardData } from "@/components/user/UserCard";
import {
  SkeletonAvatar,
  SkeletonBlock,
  SkeletonLine,
} from "@/components/ui/loading";

export function FollowersModalBody({
  isLoading,
  users,
  type,
  onFollow,
  onUnfollow,
}: {
  isLoading: boolean;
  users: UserCardData[];
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
      <div className="divide-y">
        {users.map((user) => (
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
