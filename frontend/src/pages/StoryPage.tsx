import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navigate("/app/stories")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stories
      </Button>
    </div>
  );

  if (controller.loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {backToStoriesButton}

          <div className="flex items-center justify-between gap-3">
            <Skeleton variant="text" className="h-8 w-8/12 bg-muted" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
              <Skeleton className="h-8 w-8 rounded-full bg-muted" />
            </div>
          </div>

          <Skeleton className="w-full h-[320px] rounded-lg bg-muted" />

          <div className="rounded-[1.5rem] border border-border/40 bg-card overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
                <Skeleton variant="text" className="h-4 w-24 bg-muted" />
                <Skeleton variant="text" className="h-3 w-20 bg-muted" />
                <Skeleton variant="text" className="h-3 w-16 bg-muted" />
              </div>

              <div className="space-y-3">
                <Skeleton variant="text" className="h-4 w-full bg-muted" />
                <Skeleton variant="text" className="h-4 w-11/12 bg-muted" />
                <Skeleton variant="text" className="h-4 w-10/12 bg-muted" />
                <Skeleton variant="text" className="h-4 w-8/12 bg-muted" />
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-20 rounded-xl bg-muted" />
                <Skeleton className="h-8 w-10 rounded-xl bg-muted" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border/40 p-5">
            <Skeleton variant="text" className="h-4 w-40 bg-muted" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton
                    variant="circular"
                    className="h-9 w-9 shrink-0 bg-muted"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton variant="text" className="h-4 w-28 bg-muted" />
                      <Skeleton variant="text" className="h-3 w-16 bg-muted" />
                    </div>
                    <Skeleton variant="text" className="h-4 w-full bg-muted" />
                    <Skeleton variant="text" className="h-4 w-10/12 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
