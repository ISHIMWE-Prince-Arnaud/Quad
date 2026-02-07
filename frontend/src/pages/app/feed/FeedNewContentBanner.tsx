import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FeedNewContentBanner({
  newCount,
  loading,
  onRefresh,
}: {
  newCount: number;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (newCount <= 0 || loading) return null;

  return (
    <div className="sticky top-3 z-20">
      <Card
        className="shadow-card bg-card border border-border/40 rounded-full cursor-pointer transition-all duration-200 hover:border-border/60 hover:shadow-card-hover active:scale-[0.99] animate-slide-in-from-top"
        onClick={onRefresh}>
        <CardContent className="py-2 px-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>

            <div className="min-w-0 leading-tight">
              <div className="text-sm font-bold text-foreground truncate">
                {newCount} new {newCount === 1 ? "post" : "posts"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Tap to load the latest content
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="rounded-full px-4 font-bold shadow-md active:scale-95">
            Show
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
