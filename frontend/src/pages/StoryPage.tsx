import { BackButton } from "@/components/ui/BackButton";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";
import { StoryPageSkeleton } from "@/components/ui/loading";

import { StoryDeleteDialog } from "./story/StoryDeleteDialog";
import { StoryPageBody } from "./story/StoryPageBody";
import { StoryPageHeader } from "./story/StoryPageHeader";
import { useStoryPageController } from "./story/useStoryPageController";
import { ContentNotFound } from "@/components/ui/ContentNotFound";
import { PiBookOpenTextBold } from "react-icons/pi";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const initialStory = (location.state as { story?: Story } | null)?.story;
  const refreshKey = (location.state as { refreshKey?: number } | null)
    ?.refreshKey;

  const controller = useStoryPageController({
    id,
    onNavigate: (path) => navigate(path),
    initialStory,
    refreshKey,
  });

  const backToStoriesButton = (
    <div className="flex items-center gap-2">
      <BackButton label="Back to Stories" fallbackPath="/stories" />
    </div>
  );

  if (controller.loading) {
    return <StoryPageSkeleton />;
  }

  if (controller.error) {
    return (
      <ContentNotFound
        title="Story Not Found"
        description={
          controller.error ||
          "The story you are looking for could not be found."
        }
        icon={<PiBookOpenTextBold className="h-10 w-10 text-primary" />}
        backLabel="Back to Stories"
        backPath="/stories"
      />
    );
  }

  if (!controller.story) return null;

  const isOwner = user?.clerkId === controller.story.author.clerkId;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {backToStoriesButton}

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
          readingTime={controller.readingTime}
          userReaction={controller.userReaction}
          totalReactions={controller.totalReactions}
          onSelectReaction={(type) =>
            void controller.handleSelectReaction(type)
          }
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
