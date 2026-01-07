import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Poll } from "@/types/poll";

export function MyRecentPollsSidebar({
  loading,
  polls,
  onSelectPoll,
}: {
  loading: boolean;
  polls: Poll[];
  onSelectPoll: (pollId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">My Recent Polls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading && (
          <div className="text-xs text-muted-foreground">Loading polls...</div>
        )}
        {!loading && polls.length === 0 && (
          <div className="text-xs text-muted-foreground">
            You have not created any polls yet.
          </div>
        )}
        {!loading &&
          polls.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPoll(p.id)}
              className="block w-full truncate text-left hover:underline">
              {p.question}
            </button>
          ))}
      </CardContent>
    </Card>
  );
}
