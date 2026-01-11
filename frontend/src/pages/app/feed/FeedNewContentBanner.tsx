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
      className="shadow-sm bg-[#0f121a] border border-[#2563eb]/25 cursor-pointer hover:border-[#2563eb]/40 transition-all"
      onClick={onRefresh}>
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          {newCount} new {newCount === 1 ? "update" : "updates"} in your feed
        </span>
        <Button size="sm" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
