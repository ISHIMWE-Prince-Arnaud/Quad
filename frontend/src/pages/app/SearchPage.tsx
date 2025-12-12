import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Filter,
  User,
  FileText,
  BarChart2,
  Calendar,
  Layers,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import {
  SearchService,
  type SearchHistoryItem,
} from "@/services/searchService";
import type { ApiPost, ApiProfile, ApiStory, ApiPoll } from "@/types/api";

// --- Types ---
type TabKey = "all" | "users" | "posts" | "stories" | "polls";
type SortKey = "relevance" | "date" | "popularity";

// --- Helpers ---
function highlight(text: string | undefined, query: string): ReactNode {
  if (!text) return null;
  const q = query.trim();
  if (!q) return <>{text}</>;
  const regex = new RegExp(
    `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "ig"
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark
            key={idx}
            className="bg-yellow-500/30 text-foreground font-medium rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// --- Sub-Components ---

const ResultCard = ({
  icon: Icon,
  title,
  subtitle,
  meta,
  onClick,
}: {
  icon: any;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="group flex cursor-pointer items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-accent/50 hover:shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1 space-y-1">
      <h4 className="font-medium leading-none group-hover:text-primary transition-colors">
        {title}
      </h4>
      {subtitle && (
        <p className="text-sm text-muted-foreground line-clamp-2">{subtitle}</p>
      )}
      {meta && <p className="text-xs text-muted-foreground pt-1">{meta}</p>}
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
  </div>
);

const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
      <Search className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No results found</h3>
    <p className="max-w-xs text-sm text-muted-foreground">
      We couldn't find anything matching "{query}". Try adjusting your filters
      or search term.
    </p>
  </div>
);

const SearchSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Params
  const q = (searchParams.get("q") || "").trim();
  const tab = (searchParams.get("tab") as TabKey | null) || "all";
  const sort = (searchParams.get("sort") as SortKey | null) || "relevance";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  // Local State
  const [inputValue, setInputValue] = useState(q);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Data State
  const [users, setUsers] = useState<ApiProfile[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [polls, setPolls] = useState<ApiPoll[]>([]);

  // Analytics State
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  const hasQuery = q.length > 0;

  // Derived
  const contentSortKey = useMemo<SortKey>(() => sort, [sort]);
  const userSortKey = useMemo<"relevance" | "date" | "followers">(
    () => (sort === "popularity" ? "followers" : sort),
    [sort]
  );

  const updateParams = (next: Partial<Record<string, string | null>>) => {
    const current = new URLSearchParams(searchParams);
    for (const [key, raw] of Object.entries(next)) {
      const value = raw ?? null;
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    }
    setSearchParams(current);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;
    updateParams({ q: value, tab: "all" });
  };

  // --- Effects ---

  // Initial Load (Analytics)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, p, t] = await Promise.all([
          SearchService.getSearchHistory(10),
          SearchService.getPopularSearches("global", 6),
          SearchService.getTrendingSearches("global", 6),
        ]);
        if (!cancelled) {
          setHistory(h);
          setPopular(p);
          setTrending(t);
        }
      } catch (err) {
        console.error("Failed to load search analytics", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search Execution
  useEffect(() => {
    if (!hasQuery) {
      setUsers([]);
      setPosts([]);
      setStories([]);
      setPolls([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulating a minimum delay for smoother UI transitions
        const minDelay = new Promise((resolve) => setTimeout(resolve, 300));

        let fetchPromise;
        if (tab === "all") {
          fetchPromise = SearchService.globalSearch({
            q,
            limit: 10,
            dateFrom,
            dateTo,
            sortBy: contentSortKey,
          });
        } else if (tab === "users") {
          fetchPromise = SearchService.searchUsers({
            q,
            limit: 20,
            sortBy: userSortKey,
            dateFrom,
            dateTo,
          });
        } else if (tab === "posts") {
          fetchPromise = SearchService.searchPosts({
            q,
            limit: 20,
            dateFrom,
            dateTo,
            sortBy: contentSortKey,
          });
        } else if (tab === "stories") {
          fetchPromise = SearchService.searchStories({
            q,
            limit: 20,
            dateFrom,
            dateTo,
            sortBy: contentSortKey,
          });
        } else if (tab === "polls") {
          fetchPromise = SearchService.searchPolls({
            q,
            limit: 20,
            dateFrom,
            dateTo,
            sortBy: contentSortKey,
          });
        }

        const [res] = await Promise.all([fetchPromise, minDelay]);

        if (cancelled) return;

        if (tab === "all") {
          // Type narrowing for Global Search
          const globalRes = res as any;
          setUsers(globalRes.users || []);
          setPosts(globalRes.posts || []);
          setStories(globalRes.stories || []);
          setPolls(globalRes.polls || []);
        } else if (tab === "users") {
          setUsers((res as any).results || []);
        } else if (tab === "posts") {
          setPosts((res as any).results || []);
        } else if (tab === "stories") {
          setStories((res as any).results || []);
        } else if (tab === "polls") {
          setPolls((res as any).results || []);
        }
      } catch (err) {
        console.error("Search failed", err);
        if (!cancelled) setError("We encountered an issue fetching results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, tab, contentSortKey, userSortKey, dateFrom, dateTo, hasQuery]);

  // --- Handlers ---

  const handleClearHistory = async () => {
    try {
      await SearchService.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await SearchService.deleteSearchHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const hasResults =
    users.length > 0 ||
    posts.length > 0 ||
    stories.length > 0 ||
    polls.length > 0;

  return (
    <ComponentErrorBoundary componentName="SearchPage">
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
              <p className="text-muted-foreground">
                Find people, conversations, and stories.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative w-full md:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search everything..."
                className="h-11 pl-10 pr-12 text-base shadow-sm transition-all focus:ring-2"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue("");
                    updateParams({ q: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {(["all", "users", "posts", "stories", "polls"] as TabKey[]).map(
                (key) => (
                  <Button
                    key={key}
                    variant={tab === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateParams({ tab: key })}
                    className="rounded-full capitalize">
                    {key}
                  </Button>
                )
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 ${showFilters ? "bg-secondary" : ""}`}>
              <Filter className="h-3.5 w-3.5" />
              Filters
              {(sort !== "relevance" || dateFrom) && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 text-[10px]">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2 md:grid-cols-4 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {(["relevance", "date", "popularity"] as SortKey[]).map(
                    (key) => (
                      <Button
                        key={key}
                        type="button"
                        variant={sort === key ? "secondary" : "outline"}
                        size="sm"
                        className="h-7 text-xs capitalize"
                        onClick={() => updateParams({ sort: key })}>
                        {key}
                      </Button>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-2">
                <label className="text-xs font-medium">Date Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => updateParams({ from: e.target.value })}
                      className="h-8 w-full rounded-md border bg-background pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => updateParams({ to: e.target.value })}
                      className="h-8 w-full rounded-md border bg-background pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left Column: Results */}
          <div className="min-h-[400px]">
            {!hasQuery ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Layers className="h-12 w-12 opacity-20" />
                <p className="mt-4">
                  Start typing to search users, posts, and more.
                </p>
              </div>
            ) : loading ? (
              <SearchSkeleton />
            ) : error ? (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : !hasResults ? (
              <EmptyState query={q} />
            ) : (
              <div className="space-y-8">
                {/* Users Section */}
                {(tab === "all" || tab === "users") && users.length > 0 && (
                  <section className="space-y-3">
                    {tab === "all" && (
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        People
                      </h3>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {users.map((u) => (
                        <ResultCard
                          key={u._id}
                          icon={User}
                          title={highlight(u.username, q)}
                          subtitle={u.bio || "No bio available"}
                          onClick={() => navigate(`/app/profile/${u.username}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Posts Section */}
                {(tab === "all" || tab === "posts") && posts.length > 0 && (
                  <section className="space-y-3">
                    {tab === "all" && (
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Posts
                      </h3>
                    )}
                    <div className="space-y-3">
                      {posts.map((p) => (
                        <ResultCard
                          key={p._id}
                          icon={FileText}
                          title={highlight(p.text || p.content, q)}
                          subtitle={`Posted by ${
                            p.author?.username || "Unknown"
                          }`}
                          meta={formatDate(p.createdAt)}
                          onClick={() => navigate(`/app/posts/${p._id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Stories Section */}
                {(tab === "all" || tab === "stories") && stories.length > 0 && (
                  <section className="space-y-3">
                    {tab === "all" && (
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Stories
                      </h3>
                    )}
                    <div className="space-y-3">
                      {stories.map((s) => (
                        <ResultCard
                          key={s._id}
                          icon={Layers}
                          title={highlight(s.content, q)}
                          subtitle="View story"
                          onClick={() => navigate(`/app/stories/${s._id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Polls Section */}
                {(tab === "all" || tab === "polls") && polls.length > 0 && (
                  <section className="space-y-3">
                    {tab === "all" && (
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Polls
                      </h3>
                    )}
                    <div className="space-y-3">
                      {polls.map((p) => (
                        <ResultCard
                          key={p._id}
                          icon={BarChart2}
                          title={highlight(p.question, q)}
                          subtitle={`${p.options?.length || 0} options`}
                          meta={!p.isExpired ? "Active Now" : "Ended"}
                          onClick={() => navigate(`/app/polls/${p._id}`)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar (Sticky) */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* History */}
              {history.length > 0 && (
                <Card className="shadow-none border-dashed">
                  <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent
                    </CardTitle>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => void handleClearHistory()}>
                      Clear all
                    </Button>
                  </CardHeader>
                  <CardContent className="py-2">
                    <ul className="space-y-1">
                      {history.map((h) => (
                        <li
                          key={h._id}
                          className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue(h.query);
                              updateParams({ q: h.query, tab: "all" });
                            }}
                            className="flex-1 text-left text-sm truncate">
                            {h.query}
                          </button>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(h._id, e)}
                            className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Trending */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {trending.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No trending topics
                      </span>
                    )}
                    {trending.map((term) => (
                      <Badge
                        key={term}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => {
                          setInputValue(term);
                          updateParams({ q: term, tab: "all" });
                        }}>
                        #{term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Popular
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {popular.map((term) => (
                      <Badge
                        key={term}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                        onClick={() => {
                          setInputValue(term);
                          updateParams({ q: term, tab: "all" });
                        }}>
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
