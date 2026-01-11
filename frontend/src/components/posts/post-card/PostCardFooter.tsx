import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { QuickReactionPicker } from "@/components/reactions/QuickReactionPicker";
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
  selectedEmoji,
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
  selectedEmoji: string;
  reactionCount: number;
  reactionCounts: Record<ReactionType, number>;
  onSelectReaction: (type: ReactionType) => void | Promise<void>;
}) {
  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748b] transition-all";

  return (
    <>
      <div className="flex items-center gap-6 flex-1">
        <QuickReactionPicker
          onSelect={onSelectReaction}
          onQuickSelect={(type) => onSelectReaction(type)}
          quickType="love"
          trigger={
            <button
              type="button"
              disabled={reactionPending}
              className={cn(
                actionBase,
                "hover:bg-white/5 hover:text-[#f43f5e]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                userReaction && "text-[#f43f5e]"
              )}
              aria-label={`Like post. ${reactionCount} likes`}
              title="React">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <span className="text-lg leading-none">{selectedEmoji}</span>
              </motion.div>
              <span className="text-xs font-bold">{reactionCount}</span>
            </button>
          }
        />

        <Link
          to={`/app/posts/${postId}`}
          className={cn(actionBase, "hover:bg-white/5 hover:text-[#3b82f6]")}
          aria-label={`${commentsCount} comments`}
          title="Comments">
          <MessageCircle className="h-4 w-4" />
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
            : "text-[#64748b] hover:text-[#f59e0b] hover:bg-[#f59e0b]/5"
        )}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}>
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      </button>
    </>
  );
}
