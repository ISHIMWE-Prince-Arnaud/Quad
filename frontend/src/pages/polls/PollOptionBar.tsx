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
    <div className="flex items-center gap-4">
      <div className="relative h-11 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
        {canViewResults && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#3b82f6] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        )}

        <div className="relative z-10 flex h-full items-center px-4">
          <span className="truncate text-[13px] font-semibold text-white">
            {option.text}
          </span>
        </div>
      </div>

      {canViewResults && (
        <span className="w-12 shrink-0 text-right text-[13px] font-semibold text-white">
          {percentage}%
        </span>
      )}
    </div>
  );
}
