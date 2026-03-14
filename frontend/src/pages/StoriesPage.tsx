import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { StoryCard } from "@/components/stories/StoryCard";
import { logError } from "@/lib/errorHandling";
import { PiBookOpenTextBold } from "react-icons/pi";
import { LoadMoreButton, StoriesGridSkeleton } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { useSocketStore } from "@/stores/socketStore";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [view, setView] = useState<"published" | "drafts">("published");
  const socket = useSocketStore((state) => state.socket);

  const queryParams = useMemo(() => ({ limit, skip: 0 }), [limit]);

  const fetchStories = useCallback(
    async (params: { limit: number; skip: number }) => {
      if (view === "drafts") {
        return StoryService.getMine({ ...params, status: "draft" });
      }
      return StoryService.getAll(params);
    },
    [view],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchStories(queryParams);
        if (!cancelled && res.success) {
          setStories(res.data);
          setHasMore(res.pagination?.hasMore ?? false);
          setSkip(0);
        }
      } catch (err) {
        logError(err, {
          component: "StoriesPage",
          action: "loadStories",
          metadata: { ...queryParams, view },
        });
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchStories, queryParams, view]);

  const handleLoadMore = async () => {
    try {
      const nextSkip = skip + limit;
      const res = await fetchStories({ limit, skip: nextSkip });
      if (res.success) {
        setStories((prev) => [...prev, ...res.data]);
        setSkip(nextSkip);
        setHasMore(res.pagination?.hasMore ?? false);
      }
    } catch (err) {
      logError(err, {
        component: "StoriesPage",
        action: "loadMoreStories",
        metadata: { limit, skip, view },
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    // Trigger the useEffect to refetch stories
    setSkip(0);
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s._id !== storyId));
  };

  // Real-time socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewStory = (story: Story) => {
      // Only add to the published view and avoid duplicates
      if (view === "published" && story.status === "published") {
        setStories((prev) => {
          if (prev.some((s) => s._id === story._id)) return prev;
          return [story, ...prev];
        });
      }
    };

    const handleStoryDeleted = (storyId: string) => {
      setStories((prev) => prev.filter((s) => s._id !== storyId));
    };

    const handleStoryUpdated = (story: Story) => {
      setStories((prev) =>
        prev.map((s) => (s._id === story._id ? { ...s, ...story } : s)),
      );
    };

    socket.on("newStory", handleNewStory);
    socket.on("storyDeleted", handleStoryDeleted);
    socket.on("storyUpdated", handleStoryUpdated);

    return () => {
      socket.off("newStory", handleNewStory);
      socket.off("storyDeleted", handleStoryDeleted);
      socket.off("storyUpdated", handleStoryUpdated);
    };
  }, [socket, view]);

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Stories</h1>
            <p className="text-xs text-muted-foreground">
              Explore latest happenings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={view === "published" ? "default" : "secondary"}
              onClick={() => setView("published")}
              disabled={loading}>
              Published
            </Button>
            <Button
              type="button"
              variant={view === "drafts" ? "default" : "secondary"}
              onClick={() => setView("drafts")}
              disabled={loading}>
              My Drafts
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage
              description={error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {loading && stories.length === 0 && (
          <div className="py-4">
            <StoriesGridSkeleton />
          </div>
        )}

        {!loading && stories.length === 0 && !error && (
          <EmptyState
            icon={<PiBookOpenTextBold className="h-8 w-8 text-primary" />}
            title={view === "drafts" ? "No drafts yet" : "No stories yet"}
            description={
              view === "drafts"
                ? "Draft stories you save will appear here."
                : "Be the first to share what's happening."
            }
          />
        )}

        <div className="grid gap-6 md:grid-cols-2 items-start">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onDelete={handleDeleteStory}
              variant="grid"
            />
          ))}
        </div>

        {!loading && hasMore && (
          <LoadMoreButton
            loading={loading}
            onClick={() => void handleLoadMore()}
          />
        )}
      </div>
    </div>
  );
}
