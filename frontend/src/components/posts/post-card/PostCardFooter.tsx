import { Link } from "react-router-dom";
import { Bookmark, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentCountIcon } from "@/components/engagement/CommentCountIcon";
import type { ReactionType } from "@/services/reactionService";

export function PostCardFooter({
  postId,
  commentsCount,
  bookmarked,
  bookmarkPending,
  onToggleBookmark,
  onCopyLink,
  userReaction,
  reactionPending,
  reactionCount,
  onSelectReaction,
}: {
  postId: string;
  commentsCount: number;
  bookmarked: boolean;
  bookmarkPending: boolean;
  onToggleBookmark: () => void | Promise<void>;
  onCopyLink: () => void | Promise<void>;
  userReaction: ReactionType | null;
  reactionPending: boolean;
  reactionCount: number;
  onSelectReaction: (type: ReactionType) => void | Promise<void>;
}) {
  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground transition-all";

  return (
    <>
      <div className="flex items-center gap-6 flex-1">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          ariaLabel={`React to post. ${reactionCount} reactions`}
          className={cn(actionBase, "hover:bg-white/5")}
          countClassName="text-xs font-bold text-muted-foreground"
        />

        <Link
          to={`/app/posts/${postId}`}
          className={cn(actionBase, "hover:bg-white/5 hover:text-[#3b82f6]")}
          aria-label={`${commentsCount} comments`}
          title="Comments">
          <CommentCountIcon count={commentsCount} className="h-4 w-4" />
          <span className="text-xs font-bold">{commentsCount}</span>
        </Link>

        <button
          type="button"
          onClick={onCopyLink}
          className={cn(actionBase, "hover:bg-white/5 hover:text-[#10b981]")}
          aria-label="Share post"
          title="Share">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleBookmark}
        disabled={bookmarkPending}
        className={cn(
          "p-2 rounded-xl transition-all",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          bookmarked
            ? "text-[#f59e0b] bg-[#f59e0b]/10"
            : "text-muted-foreground hover:text-warning hover:bg-warning/5",
        )}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}>
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      </button>
    </>
  );
}
