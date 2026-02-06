import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeedTab, FeedType } from "@/types/feed";

export function FeedHeaderTabs({
  feedType,
  tab,
  onFeedTypeChange,
  onTabChange,
}: {
  feedType: FeedType;
  tab: FeedTab;
  onFeedTypeChange: (next: FeedType) => void;
  onTabChange: (next: FeedTab) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex rounded-full border border-border/40 p-1 bg-muted/30">
        <Button
          type="button"
          size="sm"
          variant={feedType === "foryou" ? "default" : "ghost"}
          className={cn(
            "rounded-full px-4 transition-all duration-200",
            feedType === "foryou"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          onClick={() => onFeedTypeChange("foryou")}>
          For You
        </Button>
        <Button
          type="button"
          size="sm"
          variant={feedType === "following" ? "default" : "ghost"}
          className={cn(
            "rounded-full px-4 transition-all duration-200",
            feedType === "following"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          onClick={() => onFeedTypeChange("following")}>
          Following
        </Button>
      </div>

      <div className="flex gap-1.5 p-1 rounded-2xl bg-muted/20 border border-border/40">
        {(
          [
            ["home", "Home"],
            ["posts", "Posts"],
            ["polls", "Polls"],
          ] as [FeedTab, string][]
        ).map(([value, label]) => {
          const isActive = tab === value;
          return (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "px-4 rounded-xl font-bold transition-all",
                isActive
                  ? "bg-background text-primary shadow-sm border border-border/40"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onClick={() => onTabChange(value)}>
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
