import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickReactionPicker } from "@/components/reactions/QuickReactionPicker";
import type { ReactionType } from "@/services/reactionService";

import { reactionEmojiMap } from "./constants";

export function StoryPageBody({
  title,
  coverImage,
  contentHtml,
  authorUsername,
  createdAt,
  viewsCount,
  readingTime,
  userReaction,
  reactionCounts,
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
  reactionCounts: Record<ReactionType, number>;
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
              <QuickReactionPicker
                onSelect={onSelectReaction}
                onQuickSelect={() => onSelectReaction("love")}
                quickType="love"
                trigger={
                  <Button variant={userReaction ? "secondary" : "outline"} size="sm">
                    {userReaction ? `Reacted ${reactionEmojiMap[userReaction]}` : "React"}
                  </Button>
                }
              />
              <div className="text-sm text-muted-foreground">{totalReactions} reactions</div>
            </div>
            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
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
          </div>
        </CardContent>
      </Card>
    </>
  );
}
