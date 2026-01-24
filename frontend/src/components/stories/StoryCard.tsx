import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";

import { StoryCardBody } from "./story-card/StoryCardBody";
import { StoryCardDeleteDialog } from "./story-card/StoryCardDeleteDialog";
import { StoryCardFooter } from "./story-card/StoryCardFooter";
import { StoryCardHeader } from "./story-card/StoryCardHeader";
import { useStoryBookmark } from "./story-card/useStoryBookmark";
import { useStoryReactions } from "./story-card/useStoryReactions";
import { useStoryShare } from "./story-card/useStoryShare";

interface StoryCardProps {
  story: Story;
  onDelete?: (storyId: string) => void;
  className?: string;
  hideHeader?: boolean;
}

export function StoryCard({ story, onDelete, className, hideHeader }: StoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === story.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { bookmarked, handleToggleBookmark } = useStoryBookmark(story._id);
  const { userReaction, reactionPending, reactionCount, handleSelectReaction } =
    useStoryReactions({ storyId: story._id, initialTotal: story.reactionsCount || 0 });
  const handleCopyLink = useStoryShare({ storyId: story._id, title: story.title });

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(story._id);
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    navigate(`/app/stories/${story._id}/edit`);
  };

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
            className
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
