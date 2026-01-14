import { Card, CardContent } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import type { ReactionType } from "@/services/reactionService";

export function StoryPageBody({
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
  return (
    <>
      {coverImage && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img src={coverImage} alt={title} className="w-full max-h-[420px] object-cover" />
        </div>
      )}

      <Card>
        <CardContent className="prose prose-invert max-w-none p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>By {authorUsername}</span>
            {readingTime > 0 && <span>{readingTime} min read</span>}
            {typeof viewsCount === "number" && viewsCount > 0 && <span>{viewsCount} views</span>}
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>

          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-2">
              <HeartReactionButton
                liked={Boolean(userReaction)}
                count={totalReactions}
                onToggle={() => onSelectReaction("love")}
                ariaLabel={`React to story. ${totalReactions} reactions`}
              />
              <div className="text-sm text-muted-foreground">{totalReactions} reactions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
