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
        className="shadow-sm bg-background/70 backdrop-blur border border-primary/20 cursor-pointer hover:border-primary/35 transition-colors"
        onClick={onRefresh}>
        <CardContent className="py-2.5 px-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(37,99,235,0.18)]" />
            <span className="text-sm font-semibold text-foreground truncate">
              {newCount} new {newCount === 1 ? "post" : "posts"}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Tap to load
            </span>
          </div>

          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3">
            Show
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
