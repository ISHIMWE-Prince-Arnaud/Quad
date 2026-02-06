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
  const { bookmarked, bookmarkPending, handleToggleBookmark } =
    useStoryBookmark(storyId);

  return (
    <>
      {coverImage && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={coverImage}
            alt={title}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      <Card className="bg-card border border-border/40 rounded-[1.5rem] overflow-hidden shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              {authorUsername}
            </span>
            {readingTime > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                · {readingTime} min read
              </span>
            )}
            {typeof viewsCount === "number" && viewsCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                · {viewsCount} views
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground">
              · {timeAgo(createdAt)}
            </span>
          </div>

          <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-4">
            <HeartReactionButton
              liked={Boolean(userReaction)}
              count={totalReactions}
              onToggle={() => onSelectReaction("love")}
              className="hover:bg-red-500/10 hover:text-red-500"
              countClassName="text-sm font-bold"
              ariaLabel={`React to story. ${totalReactions} reactions`}
            />

            <button
              type="button"
              onClick={handleToggleBookmark}
              disabled={bookmarkPending}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                bookmarked
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10",
              )}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark story"}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}>
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
