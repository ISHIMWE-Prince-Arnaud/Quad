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
  onToggleBookmark: () => void;
  onCopyLink: () => void;
  userReaction: ReactionType | null;
  reactionPending: boolean;
  selectedEmoji: string;
  reactionCount: number;
  reactionCounts: Record<ReactionType, number>;
  onSelectReaction: (type: ReactionType) => void;
}) {
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
                "flex items-center gap-2 text-[#64748b] hover:text-[#f43f5e] transition-all group",
                userReaction && "text-[#f43f5e]"
              )}
              aria-label={`Like post. ${reactionCount} likes`}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <span className="text-lg leading-none">{selectedEmoji}</span>
              </motion.div>
              <span className="text-xs font-bold">{reactionCount}</span>
            </button>
          }
        />

        <Link
          to={`/app/posts/${postId}`}
          className="flex items-center gap-2 text-[#64748b] hover:text-[#3b82f6] transition-all group"
          aria-label={`${commentsCount} comments`}>
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs font-bold">{commentsCount}</span>
        </Link>

        <button
          type="button"
          onClick={onCopyLink}
          className="flex items-center gap-2 text-[#64748b] hover:text-[#10b981] transition-all group"
          aria-label="Share post">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleBookmark}
        className={cn(
          "p-2 rounded-xl transition-all",
          bookmarked
            ? "text-[#f59e0b] bg-[#f59e0b]/10"
            : "text-[#64748b] hover:text-[#f59e0b] hover:bg-[#f59e0b]/5"
        )}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}>
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      </button>
    </>
  );
}
