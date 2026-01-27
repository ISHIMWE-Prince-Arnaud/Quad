import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { cn } from "@/lib/utils";
import type { ReactionType } from "@/services/reactionService";

export function PollCardFooter({
  bookmarked,
  onToggleBookmark,
  userReaction,
  reactionCount,
  reactionPending,
  onSelectReaction,
}: {
  bookmarked: boolean;
  onToggleBookmark: () => void;
  userReaction: ReactionType | null;
  reactionCount: number;
  reactionPending: boolean;
  onSelectReaction: (type: ReactionType) => void;
}) {
  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748b] transition-all";

  return (
    <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t">
      <div className="flex items-center gap-1">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          ariaLabel={`React to poll. ${reactionCount} reactions`}
          className={cn(actionBase, "hover:bg-white/5")}
          countClassName="text-xs font-bold text-[#64748b]"
        />
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
