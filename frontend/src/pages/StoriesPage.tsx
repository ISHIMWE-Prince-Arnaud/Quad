import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryCard } from "@/components/stories/StoryCard";
import { logError } from "@/lib/errorHandling";
import { PiBookOpenTextBold } from "react-icons/pi";
import { LoadMoreButton } from "@/components/ui/loading";

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

function StoryCardSkeleton() {
  return (
    <div className="w-full overflow-hidden border border-border/40 rounded-2xl bg-card">
      <Skeleton className="aspect-video w-full rounded-none bg-muted" />
      <div className="px-6 pt-5 pb-4">
        <Skeleton variant="text" className="h-6 w-10/12 bg-muted" />
        <div className="mt-2">
          <Skeleton variant="text" className="h-4 w-11/12 bg-muted" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton
              variant="circular"
              className="h-7 w-7 shrink-0 bg-muted"
            />
            <div className="flex items-center gap-2 min-w-0">
              <Skeleton variant="text" className="h-4 w-24 bg-muted" />
              <Skeleton variant="text" className="h-3 w-16 bg-muted" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-14 rounded-lg bg-muted" />
            <Skeleton className="h-5 w-14 rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex items-center justify-between">
        <Skeleton variant="text" className="h-3 w-20 bg-muted" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-xl bg-muted" />
          <Skeleton className="h-8 w-8 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function StoriesGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      {Array.from({ length: 6 }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [limit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [view, setView] = useState<"published" | "drafts">("published");

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

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s._id !== storyId));
  };

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
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && stories.length === 0 && (
          <div className="py-4">
            <StoriesGridSkeleton />
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="py-16">
            <div className="mx-auto max-w-md rounded-3xl border border-border/40 bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <PiBookOpenTextBold className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {view === "drafts" ? "No drafts yet" : "No stories yet"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {view === "drafts"
                  ? "Draft stories you save will appear here."
                  : "Be the first to share what’s happening."}
              </p>
            </div>
          </div>
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
