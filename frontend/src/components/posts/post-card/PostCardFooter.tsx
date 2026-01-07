import { Link } from "react-router-dom";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import type { ReactionType } from "@/services/reactionService";

import { reactionEmojiMap } from "./constants";

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
  reactionCounts,
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
      <div className="flex items-center gap-1 flex-1">
        <ReactionPicker
          onSelect={onSelectReaction}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={reactionPending}
              className={cn(
                "gap-2 text-muted-foreground transition-colors",
                userReaction
                  ? "text-pink-600"
                  : "hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
              )}
              aria-label={`React to post. Current reactions: ${reactionCount}${
                userReaction ? `, You reacted with ${userReaction}` : ""
              }`}>
              <motion.span
                className="text-sm"
                aria-hidden="true"
                whileTap={{ scale: 1.2 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}>
                {selectedEmoji}
              </motion.span>
              <span className="text-xs font-medium" aria-hidden="true">
                {reactionCount}
              </span>
            </Button>
          }
        />

        {(Object.keys(reactionCounts) as ReactionType[]).some(
          (type) => reactionCounts[type] > 0
        ) && (
          <div className="flex flex-wrap gap-1 text-xs text-muted-foreground ml-1">
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
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
        asChild>
        <Link
          to={`/app/posts/${postId}`}
          aria-label={`View ${commentsCount} comments`}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium" aria-hidden="true">
            {commentsCount}
          </span>
        </Link>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCopyLink}
        className="gap-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
        aria-label="Share post">
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggleBookmark}
        className={cn(
          "gap-2 text-muted-foreground transition-colors",
          bookmarked
            ? "text-amber-600"
            : "hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
        )}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
        aria-pressed={bookmarked}>
        <motion.div
          whileTap={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <Bookmark
            className={cn("h-4 w-4", bookmarked && "fill-current")}
            aria-hidden="true"
          />
        </motion.div>
      </Button>
    </>
  );
}
