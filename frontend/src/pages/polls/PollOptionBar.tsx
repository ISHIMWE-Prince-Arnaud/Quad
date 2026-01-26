import type { PollOption } from "@/types/poll";

export function PollOptionBar({
  option,
  totalVotes,
  canViewResults,
  variant = "text",
  isLast = false,
}: {
  option: PollOption;
  totalVotes: number;
  canViewResults: boolean;
  variant?: "text" | "media";
  isLast?: boolean;
}) {
  const votesCount = option.votesCount ?? 0;
  const percentage =
    typeof option.percentage === "number"
      ? option.percentage
      : totalVotes > 0
        ? Math.round((votesCount / totalVotes) * 100)
        : 0;

  const isMedia = variant === "media";

  if (isMedia) {
    return (
      <div
        className={
          "relative flex h-11 items-center px-4 bg-white/[0.03]" +
          (!isLast ? " border-b border-white/5" : "")
        }>
        {canViewResults && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#2563eb] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        )}

        <span className="relative z-10 truncate text-[13px] font-semibold text-white">
          {option.text}
        </span>

        {canViewResults && (
          <span className="relative z-10 ml-auto pl-3 text-[13px] font-semibold text-white/90">
            {percentage}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={
          "relative h-11 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5"
        }>
        {canViewResults && (
          <div
            className={
              "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 " +
              "bg-[#3b82f6]"
            }
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
        <span
          className={
            "w-12 shrink-0 text-right text-[13px] font-semibold text-white"
          }>
          {percentage}%
        </span>
      )}
    </div>
  );
}
