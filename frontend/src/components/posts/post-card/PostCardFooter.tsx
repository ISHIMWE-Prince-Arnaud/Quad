import { PiShareNetworkBold } from "react-icons/pi";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentButton } from "@/components/engagement/CommentButton";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
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
  return (
    <>
      <div className="flex items-center gap-4 flex-1">
        <HeartReactionButton
          liked={Boolean(userReaction)}
          count={reactionCount}
          pending={reactionPending}
          onToggle={() => void onSelectReaction("love")}
          ariaLabel={`React to post. ${reactionCount} reactions`}
        />

        <CommentButton postId={postId} count={commentsCount} />

        <button
          type="button"
          onClick={onCopyLink}
          className="p-2 rounded-xl text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-200"
          aria-label="Share post"
          title="Share">
          <PiShareNetworkBold className="h-5 w-5" />
        </button>
      </div>

      <BookmarkButton
        bookmarked={bookmarked}
        pending={bookmarkPending}
        onToggle={onToggleBookmark}
        ariaLabel={bookmarked ? "Remove bookmark" : "Bookmark post"}
      />
    </>
  );
}
