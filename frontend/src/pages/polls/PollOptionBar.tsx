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
    <div className="relative h-11 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
        {canViewResults && (
          <div
            className={
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 " +
              "bg-gradient-to-r from-[#60a5fa] to-[#2563eb]"
            }
            style={{ width: `${percentage}%` }}
          />
        )}

      <div className="relative z-10 flex h-full items-center justify-between gap-4 px-5">
        <span className="min-w-0 truncate text-[13px] font-semibold text-white">
          {option.text}
        </span>

        {canViewResults && (
          <span className="shrink-0 text-[13px] font-semibold text-white/90">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}
