import type { PollOption } from "@/types/poll";

export function PollOptionBar({
  option,
  totalVotes,
  canViewResults,
}: {
  option: PollOption;
  totalVotes: number;
  canViewResults: boolean;
}) {
  const votesCount = option.votesCount ?? 0;
  const percentage =
    typeof option.percentage === "number"
      ? option.percentage
      : totalVotes > 0
        ? Math.round((votesCount / totalVotes) * 100)
        : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate">{option.text}</span>
        {canViewResults && <span className="text-muted-foreground">{percentage}%</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${canViewResults ? percentage : 0}%` }}
        />
      </div>
    </div>
  );
}
