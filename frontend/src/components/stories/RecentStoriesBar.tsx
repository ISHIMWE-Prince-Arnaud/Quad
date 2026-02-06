import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentStoriesBar({ className }: { className?: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await StoryService.getAll({ limit: 12, skip: 0 });
        if (!cancelled && res.success) {
          setStories(Array.isArray(res.data) ? res.data.slice(0, 12) : []);
        }
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && stories.length === 0) return null;

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Stories
        </h2>
        <Link
          to="/app/stories"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
          View all
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 shrink-0">
                <div className="h-16 w-16 animate-pulse rounded-full bg-skeleton border border-border/40" />
                <div className="h-3 w-12 animate-pulse rounded bg-skeleton" />
              </div>
            ))
          : stories.map((story) => (
              <Link
                key={story._id}
                to={`/app/stories/${story._id}`}
                className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[#2563eb] to-[#9333ea] transition-transform group-hover:scale-105 active:scale-95">
                  <div className="rounded-full bg-background p-[2px]">
                    <Avatar className="h-14 w-14 border border-border/40">
                      <AvatarImage
                        src={story.author.profileImage}
                        alt={story.author.username}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {story.author.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-16 text-center">
                  {story.author.username}
                </span>
              </Link>
            ))}
      </div>
    </div>
  );
}
