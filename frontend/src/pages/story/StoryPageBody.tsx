import { Card, CardContent } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import type { ReactionType } from "@/services/reactionService";
import { timeAgo } from "@/lib/timeUtils";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoryBookmark } from "@/components/stories/story-card/useStoryBookmark";

export function StoryPageBody({
  storyId,
  title,
  coverImage,
  contentHtml,
  authorUsername,
  createdAt,
  viewsCount,
  readingTime,
  userReaction,
  totalReactions,
  onSelectReaction,
}: {
  storyId: string;
  title: string;
  coverImage?: string;
  contentHtml: string;
  authorUsername: string;
  createdAt: string;
  viewsCount?: number;
  readingTime: number;
  userReaction: ReactionType | null;
  totalReactions: number;
  onSelectReaction: (type: ReactionType) => void;
}) {
  const { bookmarked, bookmarkPending, handleToggleBookmark } = useStoryBookmark(storyId);

  return (
    <>
      {coverImage && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img src={coverImage} alt={title} className="w-full max-h-[420px] object-cover" />
        </div>
      )}

      <div className="relative">
        <Card className="bg-[#0f121a] border border-white/5 rounded-[1.5rem] overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-sm font-semibold text-white">{authorUsername}</span>
              {readingTime > 0 && (
                <span className="text-xs font-medium text-[#94a3b8]">· {readingTime} min read</span>
              )}
              {typeof viewsCount === "number" && viewsCount > 0 && (
                <span className="text-xs font-medium text-[#94a3b8]">· {viewsCount} views</span>
              )}
              <span className="text-xs font-medium text-[#94a3b8]">· {timeAgo(createdAt)}</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </div>

            <div className="mt-8">
              <HeartReactionButton
                liked={Boolean(userReaction)}
                count={totalReactions}
                onToggle={() => onSelectReaction("love")}
                ariaLabel={`React to story. ${totalReactions} reactions`}
              />
            </div>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={handleToggleBookmark}
          disabled={bookmarkPending}
          className={cn(
            "absolute -bottom-4 right-4 z-10",
            "p-3 rounded-xl transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            bookmarked
              ? "text-[#f59e0b] bg-[#0f121a] border border-white/10 shadow-lg"
              : "text-[#94a3b8] bg-[#0f121a] border border-white/10 shadow-lg hover:text-[#f59e0b]"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark story"}
          title={bookmarked ? "Remove bookmark" : "Bookmark"}>
          <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
        </button>
      </div>
    </>
  );
}
