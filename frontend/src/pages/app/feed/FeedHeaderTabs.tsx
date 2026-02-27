import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
      {/* Feed type selector with sliding indicator */}
      <div className="inline-flex rounded-full border border-border/40 p-1 bg-muted/20 backdrop-blur-sm">
        {(
          [
            ["foryou", "For You"],
            ["following", "Following"],
          ] as [FeedType, string][]
        ).map(([value, label]) => {
          const isActive = feedType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onFeedTypeChange(value)}
              className={cn(
                "relative px-5 py-1.5 text-sm font-bold rounded-full transition-colors duration-200 z-10",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {isActive && (
                <motion.div
                  layoutId="feedTypeIndicator"
                  className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Content filter tabs with sliding indicator */}
      <div className="flex gap-1 p-1 rounded-2xl bg-muted/15 border border-border/30">
        {(
          [
            ["home", "Home"],
            ["posts", "Posts"],
            ["polls", "Polls"],
          ] as [FeedTab, string][]
        ).map(([value, label]) => {
          const isActive = tab === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTabChange(value)}
              className={cn(
                "relative px-4 py-1.5 text-sm font-bold rounded-xl transition-colors duration-200 z-10",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {isActive && (
                <motion.div
                  layoutId="feedTabIndicator"
                  className="absolute inset-0 bg-background rounded-xl shadow-sm border border-border/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
