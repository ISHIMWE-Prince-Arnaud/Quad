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
      className="shadow-sm border-primary/20 bg-primary/5 cursor-pointer"
      onClick={onRefresh}>
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          {newCount} new {newCount === 1 ? "update" : "updates"} in your feed
        </span>
        <Button size="sm" variant="outline">
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
