import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { SkeletonPost } from "@/components/ui/loading";
import { X } from "lucide-react";
import { StoryCard } from "@/components/stories/StoryCard";

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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "popular" | "views"
  >("newest");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      sortBy,
      limit,
      skip,
      tag: selectedTag,
    }),
    [debouncedSearch, sortBy, limit, skip, selectedTag]
  );

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
        }
      } catch (err) {
        console.error(err);
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
      const res = await StoryService.getAll({ ...queryParams, skip: nextSkip });
      if (res.success) {
        setStories((prev) => [...prev, ...res.data]);
        setSkip(nextSkip);
        setHasMore(res.pagination?.hasMore ?? false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetAndSearch = (value: string) => {
    setStories([]);
    setSkip(0);
    setSearch(value);
  };

  const handleSortChange = (
    value: "newest" | "oldest" | "popular" | "views"
  ) => {
    setStories([]);
    setSkip(0);
    setSortBy(value);
  };

  const handleTagSelect = (tag: string) => {
    setStories([]);
    setSkip(0);
    setSelectedTag(tag);
  };

  const handleClearTag = () => {
    setStories([]);
    setSkip(0);
    setSelectedTag(undefined);
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s._id !== storyId));
  };

  // Extract all unique tags from current stories
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    stories.forEach((story) => {
      story.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [stories]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-semibold">Stories</h1>
            <div className="flex items-center gap-2">
              <Input
                value={search}
                onChange={(e) => resetAndSearch(e.target.value)}
                placeholder="Search stories..."
                className="w-full md:w-64"
              />
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={sortBy}
                onChange={(e) =>
                  handleSortChange(
                    e.target.value as "newest" | "oldest" | "popular" | "views"
                  )
                }>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Popular</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Tag filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={handleClearTag}
                  className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive hover:bg-destructive/20">
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          )}
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
            <p className="text-muted-foreground">
              {selectedTag
                ? `No stories found with tag "${selectedTag}"`
                : search
                ? "No stories found matching your search"
                : "No stories available"}
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onDelete={handleDeleteStory}
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
