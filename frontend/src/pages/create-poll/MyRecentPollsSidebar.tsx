import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PiChartBarBold } from "react-icons/pi";
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
          <div className="py-8 text-center border-2 border-dashed border-border/50 rounded-2xl bg-card/10 flex flex-col items-center justify-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 mb-3 ring-1 ring-inset ring-border/50">
              <PiChartBarBold className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-[12px] font-semibold text-muted-foreground">
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
