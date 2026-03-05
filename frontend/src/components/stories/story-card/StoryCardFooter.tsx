import { PiShareNetworkBold } from "react-icons/pi";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentButton } from "@/components/engagement/CommentButton";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";

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
  return (
    <div className="px-4 pb-3 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
      <div className="flex items-center gap-3">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          ariaLabel={`React to story. ${reactionCount} reactions`}
        />

        <CommentButton postId={storyId} count={commentsCount} />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className="p-2 rounded-xl text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-200">
          <PiShareNetworkBold className="h-5 w-5" />
        </button>

        <BookmarkButton
          bookmarked={bookmarked}
          pending={bookmarkPending}
          onToggle={onToggleBookmark}
          ariaLabel={bookmarked ? "Remove bookmark" : "Bookmark story"}
        />
      </div>
    </div>
  );
}
