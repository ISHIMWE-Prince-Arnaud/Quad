import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchService } from "@/services/searchService";

export function GlobalSearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  const runSearch = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setIsOpen(false);
    navigate(`/app/search?q=${encodeURIComponent(value)}&tab=all`);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await SearchService.getSearchSuggestions(value, 8);
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to load suggestions", err);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(query);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search users, posts, stories, polls..."
          className="pl-10 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && (query.trim() || loading) && (
        <Card className="absolute top-full z-50 mt-2 w-full overflow-hidden border bg-background shadow-lg">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <ul className="max-h-64 overflow-y-auto text-sm">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted"
                    onClick={() => runSearch(s)}>
                    <span className="truncate">{s}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && suggestions.length === 0 && query.trim() && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Press Enter to search for "{query.trim()}".
            </div>
          )}

          {!loading && query.trim() && (
            <div className="border-t px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-muted-foreground"
                onClick={() => runSearch(query)}>
                <Search className="h-3 w-3" />
                <span>Search for "{query.trim()}"</span>
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
