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
    <Card
      className="shadow-sm bg-card border border-primary/25 cursor-pointer hover:border-primary/40 transition-all"
      onClick={onRefresh}>
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {newCount} new {newCount === 1 ? "update" : "updates"} in your feed
        </span>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
