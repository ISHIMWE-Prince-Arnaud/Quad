import { Loader2, ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";
import { Button } from "@/components/ui/button";

import { StoryDeleteDialog } from "./story/StoryDeleteDialog";
import { StoryPageBody } from "./story/StoryPageBody";
import { StoryPageHeader } from "./story/StoryPageHeader";
import { useStoryPageController } from "./story/useStoryPageController";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const initialStory = (location.state as { story?: Story } | null)?.story;
  const refreshKey = (location.state as { refreshKey?: number } | null)?.refreshKey;

  const controller = useStoryPageController({
    id,
    onNavigate: (path) => navigate(path),
    initialStory,
    refreshKey,
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
        <div className="mx-auto max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {controller.error}
        </div>
      </div>
    );
  }

  if (!controller.story) return null;

  const isOwner = user?.clerkId === controller.story.author.clerkId;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/stories")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Button>
        </div>

        <StoryPageHeader
          title={controller.story.title}
          isOwner={isOwner}
          onShare={() => void controller.handleShare()}
          onEdit={controller.handleEdit}
          onDelete={() => controller.setIsDeleteDialogOpen(true)}
        />

        <StoryPageBody
          storyId={controller.story._id}
          title={controller.story.title}
          coverImage={controller.story.coverImage}
          contentHtml={controller.story.content}
          authorUsername={controller.story.author.username}
          createdAt={controller.story.createdAt}
          viewsCount={controller.story.viewsCount}
          readingTime={controller.readingTime}
          userReaction={controller.userReaction}
          totalReactions={controller.totalReactions}
          onSelectReaction={(type) => void controller.handleSelectReaction(type)}
        />

        <CommentsSection
          contentType="story"
          contentId={controller.story._id}
          contentAuthorClerkId={controller.story.author.clerkId}
        />
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
