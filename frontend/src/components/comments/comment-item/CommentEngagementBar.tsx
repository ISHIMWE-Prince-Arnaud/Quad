import { ThumbsUp } from "lucide-react";
import type { ReactionType } from "@/services/reactionService";
import { cn } from "@/lib/utils";

export function CommentEngagementBar({
  userReaction,
  reactionCount,
  reactionPending,
  onSelectReaction,
  onReply,
}: {
  userReaction: ReactionType | null;
  reactionCount: number;
  reactionPending: boolean;
  onSelectReaction: (type: ReactionType) => void;
  onReply: () => void;
}) {
  const isLiked = Boolean(userReaction);

  return (
    <div className="flex items-center gap-4 pt-1">
      <button
        onClick={() => onSelectReaction("like")}
        disabled={reactionPending}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium transition-colors",
          isLiked
            ? "text-blue-500"
            : "text-muted-foreground hover:text-foreground"
        )}>
        <ThumbsUp className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
        <span>{reactionCount > 0 ? reactionCount : "Like"}</span>
      </button>

      <button
        onClick={onReply}
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        Reply
      </button>
    </div>
  );
}
