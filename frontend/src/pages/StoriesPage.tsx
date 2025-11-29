import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { Loader2 } from "lucide-react";

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

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = useMemo(
    () => ({ search: debouncedSearch || undefined, sortBy, limit, skip }),
    [debouncedSearch, sortBy, limit, skip]
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold">Stories</h1>
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => resetAndSearch(e.target.value)}
              placeholder="Search stories..."
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

        {error && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && stories.length === 0 && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading stories...
          </div>
        )}

        <div className="grid gap-4">
          {stories.map((s) => (
            <Card key={s._id}>
              <CardContent className="flex gap-4 p-4">
                {s.coverImage && (
                  <Link
                    to={`/app/stories/${s._id}`}
                    className="block w-36 shrink-0 overflow-hidden rounded-md">
                    <img
                      src={s.coverImage}
                      alt={s.title}
                      className="h-24 w-36 object-cover"
                    />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`/app/stories/${s._id}`} className="block">
                    <h2 className="truncate text-lg font-medium hover:underline">
                      {s.title}
                    </h2>
                  </Link>
                  {s.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {s.excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>by {s.author.username}</span>
                    {typeof s.readTime === "number" && (
                      <span>{s.readTime} min read</span>
                    )}
                    {typeof s.viewsCount === "number" && (
                      <span>{s.viewsCount} views</span>
                    )}
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
