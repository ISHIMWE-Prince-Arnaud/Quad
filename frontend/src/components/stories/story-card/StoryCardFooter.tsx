import { Link } from "react-router-dom";
import { Bookmark, Share2 } from "lucide-react";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentCountIcon } from "@/components/engagement/CommentCountIcon";
import { cn } from "@/lib/utils";

import type { ReactionType } from "@/services/reactionService";

export function StoryCardFooter({
  storyId,
  reactionPending,
  userReaction,
  reactionCount,
  onSelectReaction,
  commentsCount,
  onCopyLink,
  bookmarked,
  onToggleBookmark,
  bookmarkPending,
}: {
  storyId: string;
  reactionPending: boolean;
  userReaction: ReactionType | null;
  reactionCount: number;
  onSelectReaction: (type: ReactionType) => void;
  commentsCount: number;
  onCopyLink: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  bookmarkPending?: boolean;
}) {
  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748b] transition-all";

  return (
    <div className="px-4 pb-3 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
      <div className="flex items-center gap-3">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          className={cn(
            actionBase,
            "hover:bg-white/5",
            userReaction && "text-pink-600"
          )}
          iconClassName="h-3.5 w-3.5"
          countClassName="text-xs font-normal"
          ariaLabel={`React to story. ${reactionCount} reactions`}
        />

        <Link
          to={`/app/stories/${storyId}`}
          className={cn(actionBase, "hover:bg-white/5 hover:text-[#3b82f6]")}>
          <CommentCountIcon count={commentsCount} className="h-3.5 w-3.5" />
          <span>{commentsCount}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(actionBase, "hover:bg-white/5 hover:text-[#10b981]")}>
          <Share2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={bookmarkPending}
          className={cn(
            "p-2 rounded-xl transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            bookmarked
              ? "text-[#f59e0b] bg-[#f59e0b]/10"
              : "text-[#64748b] hover:text-[#f59e0b] hover:bg-[#f59e0b]/5"
          )}>
          <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
