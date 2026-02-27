import { Link } from "react-router-dom";
import { PiBookmarkSimpleBold, PiShareNetworkBold } from "react-icons/pi";

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
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground transition-all";

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
            userReaction && "text-pink-600",
          )}
          iconClassName="h-3.5 w-3.5"
          countClassName="text-xs font-normal"
          ariaLabel={`React to story. ${reactionCount} reactions`}
        />

        <Link
          to={`/app/stories/${storyId}`}
          className={cn(actionBase, "hover:bg-accent hover:text-primary")}>
          <CommentCountIcon count={commentsCount} className="h-3.5 w-3.5" />
          <span>{commentsCount}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(actionBase, "hover:bg-accent hover:text-success")}>
          <PiShareNetworkBold className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={bookmarkPending}
          className={cn(
            "p-2 rounded-xl transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            bookmarked
              ? "text-warning bg-warning/10"
              : "text-muted-foreground hover:text-warning hover:bg-warning/5",
          )}>
          <PiBookmarkSimpleBold
            className={cn("h-3.5 w-3.5", bookmarked && "fill-current")}
          />
        </button>
      </div>
    </div>
  );
}
