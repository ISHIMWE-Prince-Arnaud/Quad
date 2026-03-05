import { Card, CardContent } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
import type { ReactionType } from "@/services/reactionService";
import { timeAgo } from "@/lib/timeUtils";
import { useStoryBookmark } from "@/components/stories/story-card/useStoryBookmark";

export function StoryPageBody({
  storyId,
  title,
  coverImage,
  contentHtml,
  authorUsername,
  createdAt,
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
              ariaLabel={`React to story. ${totalReactions} reactions`}
            />

            <BookmarkButton
              bookmarked={bookmarked}
              pending={bookmarkPending}
              onToggle={handleToggleBookmark}
              ariaLabel={bookmarked ? "Remove bookmark" : "Bookmark story"}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
