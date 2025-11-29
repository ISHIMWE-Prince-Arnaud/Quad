import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import {
  SearchService,
  type SearchHistoryItem,
} from "@/services/searchService";
import type { ApiPost, ApiProfile, ApiStory, ApiPoll } from "@/types/api";

type TabKey = "all" | "users" | "posts" | "stories" | "polls";
type SortKey = "relevance" | "date" | "popularity";

function highlight(text: string | undefined, query: string): ReactNode {
  if (!text) return <>{""}</>;
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
          <mark key={idx} className="bg-yellow-500/20 px-0.5">
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = (searchParams.get("q") || "").trim();
  const tab = (searchParams.get("tab") as TabKey | null) || "all";
  const sort = (searchParams.get("sort") as SortKey | null) || "relevance";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const [inputValue, setInputValue] = useState(q);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<ApiProfile[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [stories, setStories] = useState<ApiStory[]>([]);
  const [polls, setPolls] = useState<ApiPoll[]>([]);

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([]);

  const hasQuery = q.length > 0;

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

  // Load history + analytics once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, p, t] = await Promise.all([
          SearchService.getSearchHistory(20),
          SearchService.getPopularSearches("global", 8),
          SearchService.getTrendingSearches("global", 8),
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

  // Execute search when q/tab/sort/date filters change
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
        if (tab === "all") {
          const res = await SearchService.globalSearch({
            q,
            limit: 20,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            sortBy: contentSortKey,
          });
          if (!cancelled) {
            setUsers(res.users);
            setPosts(res.posts);
            setStories(res.stories);
            setPolls(res.polls);
          }
        } else if (tab === "users") {
          const res = await SearchService.searchUsers({
            q,
            limit: 20,
            sortBy: userSortKey,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
          });
          if (!cancelled) setUsers(res.results);
        } else if (tab === "posts") {
          const res = await SearchService.searchPosts({
            q,
            limit: 20,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            sortBy: contentSortKey,
          });
          if (!cancelled) setPosts(res.results);
        } else if (tab === "stories") {
          const res = await SearchService.searchStories({
            q,
            limit: 20,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            sortBy: contentSortKey,
          });
          if (!cancelled) setStories(res.results);
        } else if (tab === "polls") {
          const res = await SearchService.searchPolls({
            q,
            limit: 20,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            sortBy: contentSortKey,
          });
          if (!cancelled) setPolls(res.results);
        }
      } catch (err) {
        console.error("Search failed", err);
        if (!cancelled) setError("Failed to load search results");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, tab, contentSortKey, userSortKey, dateFrom, dateTo, hasQuery]);

  const handleTabChange = (next: TabKey) => {
    updateParams({ tab: next });
  };

  const handleSortChange = (value: SortKey) => {
    updateParams({ sort: value });
  };

  const handleDateChange = (from: string, to: string) => {
    updateParams({ from: from || null, to: to || null });
  };

  const handleHistorySearch = (item: SearchHistoryItem) => {
    updateParams({ q: item.query, tab: "all" });
    setInputValue(item.query);
  };

  const handleQuickTerm = (term: string) => {
    updateParams({ q: term, tab: "all" });
    setInputValue(term);
  };

  const handleClearHistory = async () => {
    try {
      await SearchService.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await SearchService.deleteSearchHistoryItem(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Failed to delete history item", err);
    }
  };

  return (
    <ComponentErrorBoundary componentName="SearchPage">
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card>
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </CardTitle>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search users, posts, stories, polls..."
                  />
                  <Button type="submit" disabled={!inputValue.trim()}>
                    Search
                  </Button>
                </form>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Sort by:</span>
                  <div className="inline-flex rounded-md border bg-background text-xs">
                    {(["relevance", "date", "popularity"] as SortKey[]).map(
                      (key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSortChange(key)}
                          className={`px-2 py-1 ${
                            sort === key
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}>
                          {key === "relevance"
                            ? "Relevance"
                            : key === "date"
                            ? "Date"
                            : "Popularity"}
                        </button>
                      )
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => handleDateChange(e.target.value, dateTo)}
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) =>
                        handleDateChange(dateFrom, e.target.value)
                      }
                      className="h-8 rounded-md border bg-background px-2 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 text-sm">
                  {(
                    ["all", "users", "posts", "stories", "polls"] as TabKey[]
                  ).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTabChange(key)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        tab === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                      {key === "all"
                        ? "All"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
                {!hasQuery && (
                  <p className="text-sm text-muted-foreground">
                    Start typing to search across users, posts, stories, and
                    polls.
                  </p>
                )}
                {hasQuery && loading && (
                  <p className="text-sm text-muted-foreground">
                    Loading results...
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}

                {hasQuery && !loading && !error && (
                  <div className="space-y-6">
                    {tab === "all" && (
                      <div className="space-y-4">
                        {users.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-semibold">
                              Users
                            </h3>
                            <ul className="space-y-1 text-sm">
                              {users.map((u) => (
                                <li
                                  key={u._id}
                                  className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/app/profile/${u.username}`)
                                    }
                                    className="truncate text-left hover:underline">
                                    {u.username}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {posts.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-semibold">
                              Posts
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {posts.map((p) => (
                                <li key={p._id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/app/posts/${p._id}`)
                                    }
                                    className="block text-left hover:underline">
                                    {highlight(p.text || p.content, q)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {stories.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-semibold">
                              Stories
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {stories.map((s) => (
                                <li key={s._id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/app/stories/${s._id}`)
                                    }
                                    className="block text-left hover:underline">
                                    {highlight(s.content, q)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {polls.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-semibold">
                              Polls
                            </h3>
                            <ul className="space-y-2 text-sm">
                              {polls.map((p) => (
                                <li key={p._id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/app/polls/${p._id}`)
                                    }
                                    className="block text-left hover:underline">
                                    {highlight(p.question, q)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {users.length === 0 &&
                          posts.length === 0 &&
                          stories.length === 0 &&
                          polls.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No results found.
                            </p>
                          )}
                      </div>
                    )}

                    {tab === "users" && users.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {users.map((u) => (
                          <li key={u._id}>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/app/profile/${u.username}`)
                              }
                              className="block text-left hover:underline">
                              {u.username}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tab === "posts" && posts.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {posts.map((p) => (
                          <li key={p._id}>
                            <button
                              type="button"
                              onClick={() => navigate(`/app/posts/${p._id}`)}
                              className="block text-left hover:underline">
                              {highlight(p.text || p.content, q)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tab === "stories" && stories.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {stories.map((s) => (
                          <li key={s._id}>
                            <button
                              type="button"
                              onClick={() => navigate(`/app/stories/${s._id}`)}
                              className="block text-left hover:underline">
                              {highlight(s.content, q)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tab === "polls" && polls.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {polls.map((p) => (
                          <li key={p._id}>
                            <button
                              type="button"
                              onClick={() => navigate(`/app/polls/${p._id}`)}
                              className="block text-left hover:underline">
                              {highlight(p.question, q)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: history + analytics */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex items-center justify-between py-3">
                <CardTitle className="text-sm">Recent Searches</CardTitle>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleClearHistory()}>
                    Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                {history.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No recent searches
                  </p>
                )}
                {history.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    {history.map((h) => (
                      <li
                        key={h._id}
                        className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleHistorySearch(h)}
                          className="truncate text-left hover:underline">
                          {h.query}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => void handleDeleteHistoryItem(h._id)}>
                          <span className="sr-only">Delete</span>×
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Popular</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 py-2 text-xs">
                {popular.length === 0 && (
                  <p className="text-muted-foreground">No data</p>
                )}
                {popular.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickTerm(term)}
                    className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80">
                    {term}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Trending</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 py-2 text-xs">
                {trending.length === 0 && (
                  <p className="text-muted-foreground">No data</p>
                )}
                {trending.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickTerm(term)}
                    className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80">
                    {term}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
