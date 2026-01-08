import { Button } from "@/components/ui/button";
import { QuickReactionPicker } from "@/components/reactions/QuickReactionPicker";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/services/reactionService";

import { reactionEmojiMap } from "./constants";

export function CommentEngagementBar({
  liked,
  likesCount,
  likePending,
  onToggleLike,
  userReaction,
  reactionCount,
  reactionPending,
  reactionCounts,
  onSelectReaction,
}: {
  liked: boolean;
  likesCount: number;
  likePending: boolean;
  onToggleLike: () => void;
  userReaction: ReactionType | null;
  reactionCount: number;
  reactionPending: boolean;
  reactionCounts: Record<ReactionType, number>;
  onSelectReaction: (type: ReactionType) => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={likePending}
        onClick={onToggleLike}
        className="gap-1 text-xs text-muted-foreground hover:text-primary">
        <span>{liked ? "♥" : "♡"}</span>
        <span>{likesCount}</span>
      </Button>

      <QuickReactionPicker
        onSelect={onSelectReaction}
        onQuickSelect={(type) => onSelectReaction(type)}
        quickType="love"
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={reactionPending}
            className={cn(
              "gap-2 text-muted-foreground",
              userReaction ? "text-pink-600" : "hover:text-pink-600"
            )}>
            <span className="text-xs">{reactionCount}</span>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
        {(Object.keys(reactionCounts) as ReactionType[]).map((type) => {
          const count = reactionCounts[type] ?? 0;
          if (!count) return null;
          return (
            <span
              key={type}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
              <span>{reactionEmojiMap[type]}</span>
              <span>{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
