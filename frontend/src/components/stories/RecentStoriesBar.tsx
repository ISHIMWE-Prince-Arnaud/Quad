import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

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
    <Card
      className={cn(
        "sticky top-0 z-20 border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}>
      <div className="px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Stories</h2>
          <Link to="/app/stories" className="text-xs text-muted-foreground hover:underline">
            View all
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex w-[84px] flex-col items-center gap-2">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))
            : stories.map((story) => (
                <Link
                  key={story._id}
                  to={`/app/stories/${story._id}`}
                  className="flex w-[84px] flex-col items-center gap-2">
                  <div className="relative">
                    <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-pink-500">
                      <div className="rounded-full bg-background p-[2px]">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={story.author.profileImage}
                            alt={story.author.username}
                          />
                          <AvatarFallback>
                            {story.author.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                  <div className="w-full truncate text-center text-xs text-muted-foreground">
                    {story.author.username}
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </Card>
  );
}
