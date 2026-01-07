import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuthStore } from "@/stores/authStore";

import { StoryDeleteDialog } from "./story/StoryDeleteDialog";
import { StoryPageBody } from "./story/StoryPageBody";
import { StoryPageHeader } from "./story/StoryPageHeader";
import { useStoryPageController } from "./story/useStoryPageController";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const controller = useStoryPageController({
    id,
    onNavigate: (path) => navigate(path),
  });

  if (controller.loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading story...
      </div>
    );
  }

  if (controller.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {controller.error}
        </div>
      </div>
    );
  }

  if (!controller.story) return null;

  const isOwner = user?.clerkId === controller.story.author.clerkId;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <StoryPageHeader
          title={controller.story.title}
          isOwner={isOwner}
          onShare={() => void controller.handleShare()}
          onEdit={controller.handleEdit}
          onDelete={() => controller.setIsDeleteDialogOpen(true)}
        />

        <StoryPageBody
          title={controller.story.title}
          coverImage={controller.story.coverImage}
          contentHtml={controller.story.content}
          authorUsername={controller.story.author.username}
          createdAt={controller.story.createdAt}
          viewsCount={controller.story.viewsCount}
          readingTime={controller.readingTime}
          userReaction={controller.userReaction}
          reactionCounts={controller.reactionCounts}
          totalReactions={controller.totalReactions}
          onSelectReaction={(type) => void controller.handleSelectReaction(type)}
        />

        <CommentsSection contentType="story" contentId={controller.story._id} />
      </div>

      {/* Delete confirmation dialog */}
      <StoryDeleteDialog
        open={controller.isDeleteDialogOpen}
        onOpenChange={controller.setIsDeleteDialogOpen}
        onConfirm={() => void controller.handleDelete()}
        loading={controller.deleting}
      />
    </div>
  );
}
