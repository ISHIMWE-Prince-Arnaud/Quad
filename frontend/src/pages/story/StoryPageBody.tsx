import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { BookmarkButton } from "@/components/engagement/BookmarkButton";
import type { ReactionType } from "@/services/reactionService";
import { timeAgo } from "@/lib/timeUtils";
import { useStoryBookmark } from "@/components/stories/story-card/useStoryBookmark";
import { MediaLightbox } from "@/components/ui/MediaLightbox";

function StoryContent({ contentHtml }: { contentHtml: string }) {
  const sanitizedContent = useMemo(() =>
    DOMPurify.sanitize(contentHtml, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "b", "em", "i", "u", "s", "del", "mark",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li",
        "blockquote", "pre", "code",
        "a", "table", "thead", "tbody", "tr", "th", "td",
        "hr", "span", "div", "img"
      ],
      ALLOWED_ATTR: [
        "href", "title", "target", "rel",
        "class", "style", "src", "alt", "width", "height"
      ],
      ALLOW_DATA_ATTR: false,
    }),
    [contentHtml]
  );

  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}

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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      {coverImage && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={coverImage}
            alt={title}
            className="w-full max-h-[420px] object-cover cursor-pointer hover:opacity-95 transition-opacity duration-200"
            onClick={() => setLightboxOpen(true)}
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
            <StoryContent contentHtml={contentHtml} />
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

      {coverImage && (
        <MediaLightbox
          media={[{ url: coverImage, type: "image" }]}
          currentIndex={0}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={() => {}}
          onPrev={() => {}}
        />
      )}
    </>
  );
}
