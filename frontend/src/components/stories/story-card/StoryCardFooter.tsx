import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
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
}) {
  return (
    <div className="px-4 pb-3 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
      <div className="flex items-center gap-3">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          className={cn(
            "flex items-center gap-1 hover:text-pink-600 transition-colors",
            userReaction && "text-pink-600"
          )}
          iconClassName="h-3.5 w-3.5"
          countClassName="text-xs font-normal"
          ariaLabel={`React to story. ${reactionCount} reactions`}
        />

        <Link
          to={`/app/stories/${storyId}`}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <MessageCircle
            className={cn(
              "h-3.5 w-3.5",
              commentsCount > 0 && "text-[#2563EB] fill-current"
            )}
          />
          <span>{commentsCount}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className="hover:text-green-600 transition-colors">
          <Share2 className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          className={cn(
            "transition-colors",
            bookmarked ? "text-amber-600" : "hover:text-amber-600"
          )}>
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
