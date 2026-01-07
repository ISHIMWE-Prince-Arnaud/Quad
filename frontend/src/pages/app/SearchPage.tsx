import { useEffect, useMemo, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
import { SearchControls } from "./search/SearchControls";
import { SearchHeader } from "./search/SearchHeader";
import { SearchResults } from "./search/SearchResults";
import { SearchSidebar } from "./search/SearchSidebar";
import {
  SearchService,
  type SearchHistoryItem,
} from "@/services/searchService";
import type { ApiPost, ApiProfile, ApiStory, ApiPoll } from "@/types/api";
import type { SortKey, TabKey } from "./search/searchTypes";

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

  const handleSubmit = (e: FormEvent) => {
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
          const globalRes = res as Awaited<ReturnType<typeof SearchService.globalSearch>>;
          setUsers(globalRes.users || []);
          setPosts(globalRes.posts || []);
          setStories(globalRes.stories || []);
          setPolls(globalRes.polls || []);
        } else if (tab === "users") {
          const userRes = res as Awaited<ReturnType<typeof SearchService.searchUsers>>;
          setUsers(userRes.results || []);
        } else if (tab === "posts") {
          const postRes = res as Awaited<ReturnType<typeof SearchService.searchPosts>>;
          setPosts(postRes.results || []);
        } else if (tab === "stories") {
          const storyRes = res as Awaited<ReturnType<typeof SearchService.searchStories>>;
          setStories(storyRes.results || []);
        } else if (tab === "polls") {
          const pollRes = res as Awaited<ReturnType<typeof SearchService.searchPolls>>;
          setPolls(pollRes.results || []);
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

  const handleDeleteHistoryItem = async (id: string, e: MouseEvent) => {
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
          <SearchHeader
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            onClear={() => {
              setInputValue("");
              updateParams({ q: "" });
            }}
            onSubmit={handleSubmit}
          />

          <SearchControls
            tab={tab}
            sort={sort}
            dateFrom={dateFrom}
            dateTo={dateTo}
            showFilters={showFilters}
            onTabChange={(nextTab) => updateParams({ tab: nextTab })}
            onToggleFilters={() => setShowFilters((v) => !v)}
            onSortChange={(nextSort) => updateParams({ sort: nextSort })}
            onDateFromChange={(value) => updateParams({ from: value })}
            onDateToChange={(value) => updateParams({ to: value })}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <SearchResults
            q={q}
            tab={tab}
            hasQuery={hasQuery}
            loading={loading}
            error={error}
            hasResults={hasResults}
            users={users}
            posts={posts}
            stories={stories}
            polls={polls}
            navigate={navigate}
          />

          <SearchSidebar
            history={history}
            trending={trending}
            popular={popular}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onSelectQuery={(query) => {
              setInputValue(query);
              updateParams({ q: query, tab: "all" });
            }}
          />
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
