import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeUtils";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";
import { PiBookmarkSimpleBold, PiShareNetworkBold } from "react-icons/pi";

import { StoryCardBody } from "./story-card/StoryCardBody";
import { StoryCardDeleteDialog } from "./story-card/StoryCardDeleteDialog";
import { StoryCardFooter } from "./story-card/StoryCardFooter";
import { StoryCardHeader } from "./story-card/StoryCardHeader";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { CommentCountIcon } from "@/components/engagement/CommentCountIcon";
import { useStoryBookmark } from "./story-card/useStoryBookmark";
import { useStoryReactions } from "./story-card/useStoryReactions";
import { useStoryShare } from "./story-card/useStoryShare";

interface StoryCardProps {
  story: Story;
  onDelete?: (storyId: string) => void;
  className?: string;
  hideHeader?: boolean;
  variant?: "default" | "grid";
}

function getStorySnippet(content: string, maxLength: number = 120) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

function formatStoryTimestamp(createdAt: string) {
  const label = timeAgo(createdAt);
  if (label === "1 day ago") return "Yesterday";
  return label;
}

export function StoryCard({
  story,
  onDelete,
  className,
  hideHeader,
  variant = "default",
}: StoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === story.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { bookmarked, bookmarkPending, handleToggleBookmark } =
    useStoryBookmark(story._id);
  const { userReaction, reactionPending, reactionCount, handleSelectReaction } =
    useStoryReactions({
      storyId: story._id,
      initialTotal: story.reactionsCount || 0,
    });
  const handleCopyLink = useStoryShare({
    storyId: story._id,
    title: story.title,
  });

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(story._id);
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    navigate(`/app/stories/${story._id}/edit`);
  };

  if (variant === "grid") {
    const snippet = getStorySnippet(story.content);
    const timestamp = formatStoryTimestamp(story.createdAt);

    return (
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: -8, scale: 1.01 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}>
        <Card
          className={cn(
            "w-full overflow-hidden border border-border/40 rounded-2xl bg-card",
            className,
          )}>
          {story.coverImage && (
            <Link to={`/app/stories/${story._id}`} className="block">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
          )}

          <CardContent className="px-6 pt-5 pb-4">
            <Link to={`/app/stories/${story._id}`} className="block">
              <h3 className="text-xl font-semibold text-foreground leading-snug line-clamp-1 min-h-[1.75rem]">
                {story.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 dark:text-muted-foreground leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {snippet}
              </p>
            </Link>

            <div className="mt-6 flex items-center justify-between gap-4">
              <Link
                to={`/app/profile/${story.author.username}`}
                className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={story.author.profileImage} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {story.author.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {story.author.username}
                  </span>
                  {story.readTime ? (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      · {story.readTime} min read
                    </span>
                  ) : null}
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <HeartReactionButton
                  liked={Boolean(userReaction)}
                  count={reactionCount}
                  pending={reactionPending}
                  onToggle={() => void handleSelectReaction("love")}
                  className={cn(
                    "flex items-center gap-2 text-sm text-muted-foreground transition-all duration-200",
                    "hover:text-red-500 hover:bg-red-500/10 px-2 py-1 rounded-lg",
                    userReaction && "text-red-500",
                  )}
                  iconClassName="h-4 w-4"
                  countClassName="text-sm font-bold"
                  ariaLabel={`React to story. ${reactionCount} reactions`}
                />

                <Link
                  to={`/app/stories/${story._id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 px-2 py-1 rounded-lg transition-all duration-200">
                  <CommentCountIcon
                    count={story.commentsCount || 0}
                    className="h-4 w-4"
                  />
                  <span className="font-bold">{story.commentsCount || 0}</span>
                </Link>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 pb-6 pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{timestamp}</span>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-xl text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200">
                <PiShareNetworkBold className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={bookmarkPending}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  bookmarked
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10",
                )}>
                <PiBookmarkSimpleBold
                  className={cn("h-4 w-4", bookmarked && "fill-current")}
                />
              </button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: -8, scale: 1.01 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}>
        <Card
          className={cn(
            "w-full transition-shadow duration-300 overflow-hidden",
            "hover:shadow-lg",
            className,
          )}>
          {!hideHeader && (
            <CardHeader className="pb-2 px-4 pt-3">
              <StoryCardHeader
                storyId={story._id}
                createdAt={story.createdAt}
                isOwner={!!isOwner}
                onCopyLink={handleCopyLink}
                onEdit={handleEdit}
                onDelete={() => setIsDeleteDialogOpen(true)}
              />
            </CardHeader>
          )}

          {/* Story content */}
          <CardContent className="p-0">
            <StoryCardBody
              storyId={story._id}
              coverImage={story.coverImage}
              title={story.title}
              content={story.content}
              authorUsername={story.author.username}
              authorProfileImage={story.author.profileImage}
              readTime={story.readTime}
            />
          </CardContent>

          {/* Interaction buttons */}
          <CardFooter className="p-0">
            <StoryCardFooter
              storyId={story._id}
              reactionPending={reactionPending}
              userReaction={userReaction}
              reactionCount={reactionCount}
              onSelectReaction={handleSelectReaction}
              commentsCount={story.commentsCount || 0}
              onCopyLink={handleCopyLink}
              bookmarked={bookmarked}
              bookmarkPending={bookmarkPending}
              onToggleBookmark={handleToggleBookmark}
            />
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <StoryCardDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
}
