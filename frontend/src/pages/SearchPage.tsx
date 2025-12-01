import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { SearchService } from "@/services/searchService";
import { UserCard } from "@/components/user/UserCard";
import { PostCard } from "@/components/posts/PostCard";
import { StoryCard } from "@/components/stories/StoryCard";
import { PollCard } from "@/components/polls/PollCard";
import {
  SearchFilters,
  type SearchFiltersState,
} from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiProfile, ApiPost, ApiStory, ApiPoll } from "@/types/api";
import type { Post } from "@/types/post";
import type { Story } from "@/types/story";
import type { Poll } from "@/types/poll";
import toast from "react-hot-toast";

type SearchTab = "all" | "users" | "posts" | "stories" | "polls";

const tabs: { id: SearchTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "users", label: "Users" },
  { id: "posts", label: "Posts" },
  { id: "stories", label: "Stories" },
  { id: "polls", label: "Polls" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tabParam = searchParams.get("tab") || "all";
  const activeTab = tabs.find((t) => t.id === tabParam)?.id || "all";

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ApiProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [filters, setFilters] = useState<SearchFiltersState>({
    sortBy: "relevance",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const handleTabChange = (tab: SearchTab) => {
    setSearchParams({ q: query, tab });
    setOffset(0);
  };

  const performSearch = async (isLoadMore = false) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const currentOffset = isLoadMore ? offset : 0;

      if (activeTab === "all") {
        // Global search
        const result = await SearchService.globalSearch({
          q: query,
          limit: 10,
          offset: currentOffset,
          sortBy: filters.sortBy,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        if (isLoadMore) {
          setUsers((prev) => [...prev, ...result.users]);
          setPosts((prev) => [...prev, ...result.posts.map(mapApiPostToPost)]);
          setStories((prev) => [
            ...prev,
            ...result.stories.map(mapApiStoryToStory),
          ]);
          setPolls((prev) => [...prev, ...result.polls.map(mapApiPollToPoll)]);
        } else {
          setUsers(result.users);
          setPosts(result.posts.map(mapApiPostToPost));
          setStories(result.stories.map(mapApiStoryToStory));
          setPolls(result.polls.map(mapApiPollToPoll));
        }

        // For "all" tab, we consider there's more if any category has results
        setHasMore(result.total > currentOffset + 10);
      } else if (activeTab === "users") {
        const result = await SearchService.searchUsers({
          q: query,
          limit,
          offset: currentOffset,
          sortBy: filters.sortBy as any,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        if (isLoadMore) {
          setUsers((prev) => [...prev, ...result.results]);
        } else {
          setUsers(result.results);
        }
        setHasMore(result.hasMore);
      } else if (activeTab === "posts") {
        const result = await SearchService.searchPosts({
          q: query,
          limit,
          offset: currentOffset,
          sortBy: filters.sortBy,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        if (isLoadMore) {
          setPosts((prev) => [
            ...prev,
            ...result.results.map(mapApiPostToPost),
          ]);
        } else {
          setPosts(result.results.map(mapApiPostToPost));
        }
        setHasMore(result.hasMore);
      } else if (activeTab === "stories") {
        const result = await SearchService.searchStories({
          q: query,
          limit,
          offset: currentOffset,
          sortBy: filters.sortBy,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        if (isLoadMore) {
          setStories((prev) => [
            ...prev,
            ...result.results.map(mapApiStoryToStory),
          ]);
        } else {
          setStories(result.results.map(mapApiStoryToStory));
        }
        setHasMore(result.hasMore);
      } else if (activeTab === "polls") {
        const result = await SearchService.searchPolls({
          q: query,
          limit,
          offset: currentOffset,
          sortBy: filters.sortBy,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });

        if (isLoadMore) {
          setPolls((prev) => [
            ...prev,
            ...result.results.map(mapApiPollToPoll),
          ]);
        } else {
          setPolls(result.results.map(mapApiPollToPoll));
        }
        setHasMore(result.hasMore);
      }

      if (isLoadMore) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset results when query, tab, or filters change
    setUsers([]);
    setPosts([]);
    setStories([]);
    setPolls([]);
    setOffset(0);
    setHasMore(false);

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab, filters]);

  const handleLoadMore = () => {
    performSearch(true);
  };

  // Helper functions to map API types to component types
  const mapApiPostToPost = (apiPost: ApiPost): Post => ({
    _id: apiPost._id,
    userId: apiPost.author._id,
    author: apiPost.author,
    text: apiPost.text,
    media: apiPost.media || [],
    reactionsCount: apiPost.reactionsCount || 0,
    commentsCount: apiPost.commentsCount || 0,
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
  });

  const mapApiStoryToStory = (apiStory: ApiStory): Story => ({
    _id: apiStory._id,
    author: {
      clerkId: apiStory.author.clerkId,
      username: apiStory.author.username,
      email: apiStory.author.email,
      profileImage: apiStory.author.profileImage,
      bio: apiStory.author.bio,
    },
    title: apiStory.content || "Untitled Story",
    content: apiStory.content || "",
    coverImage: apiStory.media,
    status: "published",
    viewsCount: apiStory.views,
    reactionsCount: 0,
    commentsCount: 0,
    createdAt: apiStory.createdAt,
    updatedAt: apiStory.createdAt,
  });

  const mapApiPollToPoll = (apiPoll: ApiPoll): Poll => ({
    id: apiPoll._id,
    author: apiPoll.author,
    question: apiPoll.question,
    options: apiPoll.options.map((opt, idx) => ({
      index: idx,
      text: opt.option,
      votesCount: opt.votes,
      percentage: opt.percentage,
    })),
    settings: {
      allowMultiple: apiPoll.allowMultipleVotes,
      showResults: "always",
    },
    status: apiPoll.isExpired ? "expired" : "active",
    expiresAt: apiPoll.expiresAt,
    totalVotes: apiPoll.totalVotes,
    reactionsCount: 0,
    commentsCount: 0,
    userVote: apiPoll.userVote ? [0] : undefined,
    canViewResults: true,
    createdAt: apiPoll.createdAt,
    updatedAt: apiPoll.updatedAt,
  });

  const hasResults =
    users.length > 0 ||
    posts.length > 0 ||
    stories.length > 0 ||
    polls.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
        {query && (
          <p className="text-muted-foreground">
            Results for "<span className="font-medium">{query}</span>"
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors duration-200 relative whitespace-nowrap",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {query && (
        <div className="mb-6">
          <SearchFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Loading State */}
      {loading && offset === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !hasResults && query && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find anything matching "{query}". Try different keywords
            or check your spelling.
          </p>
        </div>
      )}

      {/* No Query State */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start searching</h3>
          <p className="text-muted-foreground max-w-md">
            Enter a search term to find users, posts, stories, and polls.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="space-y-6">
          {/* All Tab - Show mixed results */}
          {activeTab === "all" && (
            <>
              {users.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Users</h2>
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user) => (
                      <UserCard key={user._id} user={user} compact />
                    ))}
                  </div>
                </div>
              )}

              {posts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Posts</h2>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {stories.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Stories</h2>
                  <div className="space-y-4">
                    {stories.slice(0, 3).map((story) => (
                      <StoryCard key={story._id} story={story} />
                    ))}
                  </div>
                </div>
              )}

              {polls.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Polls</h2>
                  <div className="space-y-4">
                    {polls.slice(0, 3).map((poll) => (
                      <PollCard key={poll.id} poll={poll} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Users Tab */}
          {activeTab === "users" && users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <UserCard key={user._id} user={user} compact />
              ))}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Stories Tab */}
          {activeTab === "stories" && stories.length > 0 && (
            <div className="space-y-4">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} />
              ))}
            </div>
          )}

          {/* Polls Tab */}
          {activeTab === "polls" && polls.length > 0 && (
            <div className="space-y-4">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="min-w-[200px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
