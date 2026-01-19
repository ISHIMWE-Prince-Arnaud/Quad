import { Link } from "react-router-dom";
import { Bookmark, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentCountIcon } from "@/components/engagement/CommentCountIcon";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/services/reactionService";

export function PollCardFooter({
  pollId,
  commentsCount,
  onCopyLink,
  bookmarked,
  onToggleBookmark,
  userReaction,
  reactionCount,
  reactionPending,
  onSelectReaction,
}: {
  pollId: string;
  commentsCount: number;
  onCopyLink: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  userReaction: ReactionType | null;
  reactionCount: number;
  reactionPending: boolean;
  onSelectReaction: (type: ReactionType) => void;
}) {
  return (
    <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t">
      <div className="flex items-center gap-1">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          className={cn("gap-2", userReaction ? "text-pink-600" : "")}
          ariaLabel={`React to poll. ${reactionCount} reactions`}
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-blue-600"
          asChild>
          <Link to={`/app/polls/${pollId}`}>
            <CommentCountIcon count={commentsCount} className="h-4 w-4" />
            <span className="text-xs">{commentsCount}</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCopyLink}
          className="gap-2 text-muted-foreground hover:text-green-600">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleBookmark}
          className={cn(
            "gap-2 text-muted-foreground",
            bookmarked ? "text-amber-600" : "hover:text-amber-600"
          )}>
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  );
}
