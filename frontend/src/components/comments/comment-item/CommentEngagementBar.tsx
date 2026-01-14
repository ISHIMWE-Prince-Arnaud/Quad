import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import type { ReactionType } from "@/services/reactionService";

export function CommentEngagementBar({
  userReaction,
  reactionCount,
  reactionPending,
  onSelectReaction,
}: {
  userReaction: ReactionType | null;
  reactionCount: number;
  reactionPending: boolean;
  onSelectReaction: (type: ReactionType) => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <HeartReactionButton
        liked={Boolean(userReaction)}
        count={reactionCount}
        pending={reactionPending}
        onToggle={() => onSelectReaction("love")}
        className={"text-muted-foreground hover:text-pink-600"}
        iconClassName="h-4 w-4"
        countClassName="text-xs"
        ariaLabel={`React to comment. ${reactionCount} reactions`}
      />
    </div>
  );
}
