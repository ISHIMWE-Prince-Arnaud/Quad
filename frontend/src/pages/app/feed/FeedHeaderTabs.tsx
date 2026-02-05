import { Button } from "@/components/ui/button";
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
      <div className="inline-flex rounded-full border p-1 bg-muted/40">
        <Button
          type="button"
          size="sm"
          variant={feedType === "foryou" ? "default" : "ghost"}
          className="rounded-full px- hover:bg-secondary"
          onClick={() => onFeedTypeChange("foryou")}>
          For You
        </Button>
        <Button
          type="button"
          size="sm"
          variant={feedType === "following" ? "default" : "ghost"}
          className="rounded-full px- hover:bg-secondary"
          onClick={() => onFeedTypeChange("following")}>
          Following
        </Button>
      </div>

      <div className="flex gap-1 text-sm">
        {(
          [
            ["home", "Home"],
            ["posts", "Posts"],
            ["polls", "Polls"],
          ] as [FeedTab, string][]
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={tab === value ? "secondary" : "ghost"}
            className="px-3"
            onClick={() => onTabChange(value)}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
