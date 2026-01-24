import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { SkeletonPost } from "@/components/ui/loading";
import { StoryCard } from "@/components/stories/StoryCard";
import { logError } from "@/lib/errorHandling";
import { Plus } from "lucide-react";

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

  const queryParams = useMemo(() => ({ limit, skip: 0 }), [limit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await StoryService.getAll(queryParams);
        if (!cancelled && res.success) {
          setStories(res.data);
          setHasMore(res.pagination?.hasMore ?? false);
          setSkip(0);
        }
      } catch (err) {
        logError(err, { component: "StoriesPage", action: "loadStories", metadata: queryParams });
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const handleLoadMore = async () => {
    try {
      const nextSkip = skip + limit;
      const res = await StoryService.getAll({ limit, skip: nextSkip });
      if (res.success) {
        setStories((prev) => [...prev, ...res.data]);
        setSkip(nextSkip);
        setHasMore(res.pagination?.hasMore ?? false);
      }
    } catch (err) {
      logError(err, { component: "StoriesPage", action: "loadMoreStories", metadata: { limit, skip } });
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
            <h1 className="text-lg font-semibold text-white">Stories</h1>
            <p className="text-xs text-[#64748b]">Explore latest happenings on campus</p>
          </div>

          <Button asChild className="h-9 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
            <Link to="/app/create/story" className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">Create Story</span>
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && stories.length === 0 && (
          <div className="space-y-4 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonPost key={i} />
            ))}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No stories available</p>
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
          <div className="mt-6 flex justify-center">
            <Button onClick={() => void handleLoadMore()}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  );
}
