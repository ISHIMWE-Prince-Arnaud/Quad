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
        ariaLabel={`React to comment. ${likesCount} reactions`}
      />
    </div>
  );
}
