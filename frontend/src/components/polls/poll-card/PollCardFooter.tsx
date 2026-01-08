import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { QuickReactionPicker } from "@/components/reactions/QuickReactionPicker";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/services/reactionService";
import { reactionEmojiMap } from "./usePollReactions";

export function PollCardFooter({
  pollId,
  commentsCount,
  onCopyLink,
  bookmarked,
  onToggleBookmark,
  userReaction,
  selectedEmoji,
  reactionCount,
  reactionCounts,
  reactionPending,
  onSelectReaction,
}: {
  pollId: string;
  commentsCount: number;
  onCopyLink: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  userReaction: ReactionType | null;
  selectedEmoji: string;
  reactionCount: number;
  reactionCounts: Record<ReactionType, number>;
  reactionPending: boolean;
  onSelectReaction: (type: ReactionType) => void;
}) {
  return (
    <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t">
      <div className="flex items-center gap-1">
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
              <span className="text-sm">{selectedEmoji}</span>
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

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-blue-600"
          asChild>
          <Link to={`/app/polls/${pollId}`}>
            <MessageCircle className="h-4 w-4" />
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
