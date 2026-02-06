import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";

export function CommentEngagementBar({
  liked,
  likesCount,
  likePending,
  onToggleLike,
}: {
  liked: boolean;
  likesCount: number;
  likePending: boolean;
  onToggleLike: () => void;
}) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <HeartReactionButton
        liked={liked}
        count={likesCount}
        pending={likePending}
        onToggle={onToggleLike}
        ariaLabel={`Like comment. ${likesCount} likes`}
        className="px-2 py-1 hover:bg-red-500/10 hover:text-red-500"
        iconClassName="h-4 w-4"
        countClassName="text-xs font-semibold text-muted-foreground"
      />
    </div>
  );
}
