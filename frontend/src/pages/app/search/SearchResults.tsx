import { Layers, User, FileText, BarChart2 } from "lucide-react";
import type { NavigateFunction } from "react-router-dom";

import { EmptyState, ResultCard, SearchSkeleton } from "./searchUtils";
import { formatDate, highlight } from "./searchHelpers";
import type { TabKey } from "./searchTypes";
import type { ApiPoll, ApiPost, ApiProfile, ApiStory } from "@/types/api";

export function SearchResults({
  q,
  tab,
  hasQuery,
  loading,
  error,
  hasResults,
  users,
  posts,
  stories,
  polls,
  navigate,
}: {
  q: string;
  tab: TabKey;
  hasQuery: boolean;
  loading: boolean;
  error: string | null;
  hasResults: boolean;
  users: ApiProfile[];
  posts: ApiPost[];
  stories: ApiStory[];
  polls: ApiPoll[];
  navigate: NavigateFunction;
}) {
  return (
    <div className="min-h-[400px]">
      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Layers className="h-12 w-12 opacity-20" />
          <p className="mt-4">Start typing to search users, posts, and more.</p>
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
                    subtitle={`Posted by ${p.author?.username || "Unknown"}`}
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
  );
}
