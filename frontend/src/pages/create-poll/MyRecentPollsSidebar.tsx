import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Poll } from "@/types/poll";

export function MyRecentPollsSidebar({
  loading,
  polls,
  onSelectPoll,
}: {
  loading: boolean;
  polls: Poll[];
  onSelectPoll: () => void;
}) {
  return (
    <Card className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl">
      <CardHeader className="p-6 pb-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          My Recent Polls
        </h2>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border/40 rounded-2xl">
            <p className="text-[11px] font-medium text-muted-foreground">
              No polls created yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {polls.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={onSelectPoll}
                className="block w-full text-left p-2 rounded-xl text-[13px] font-medium text-foreground hover:bg-accent hover:text-primary transition-all truncate group">
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                  #{" "}
                </span>
                {p.question}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
