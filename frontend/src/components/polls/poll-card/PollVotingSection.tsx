import { AnimatePresence, motion } from "framer-motion";

import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Poll } from "@/types/poll";

export function PollVotingSection({
  poll,
  localPoll,
  selectedIndices,
  canVote,
  voting,
  resultsVisible,
  onVoteOption,
}: {
  poll: Poll;
  localPoll: Poll;
  selectedIndices: number[]
  canVote: boolean;
  voting: boolean;
  resultsVisible: boolean;
  onVoteOption: (index: number) => void;
}) {
  const formatExpiresIn = (future: Date): string => {
    const now = new Date();
    const diffMs = future.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    if (diffMs >= 2 * monthMs)
      return `Expires in ${Math.ceil(diffMs / monthMs)} months`;
    if (diffMs >= monthMs) return "Expires in 1 month";

    if (diffMs >= 2 * weekMs)
      return `Expires in ${Math.ceil(diffMs / weekMs)} weeks`;
    if (diffMs >= weekMs) return "Expires in 1 week";

    if (diffMs >= 2 * dayMs)
      return `Expires in ${Math.ceil(diffMs / dayMs)} days`;
    if (diffMs >= dayMs) return "Expires in 1 day";

    if (diffMs >= 2 * hourMs)
      return `Expires in ${Math.ceil(diffMs / hourMs)} hours`;
    if (diffMs >= hourMs) return "Expires in 1 hour";

    if (diffMs >= 2 * minuteMs)
      return `Expires in ${Math.ceil(diffMs / minuteMs)} minutes`;
    return "Expires in 1 minute";
  };

  const expiresLabel = (() => {
    if (!localPoll.expiresAt) return null;
    const d = new Date(localPoll.expiresAt);
    if (Number.isNaN(d.getTime())) return null;

    const dateText = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const now = new Date();
    const isFuture = d.getTime() > now.getTime();

    if (localPoll.status === "closed") {
      return `Ended ${dateText}`;
    }

    if (localPoll.status === "expired" || !isFuture) {
      return `Expired ${dateText}`;
    }

    return formatExpiresIn(d);
  })();

  return (
    <CardContent className="pb-3 space-y-3">
      <div className="space-y-3">
        {/* Question */}
        <h3 className="font-semibold text-base">{poll.question}</h3>

        {/* Question media */}
        {poll.questionMedia && (
          <div className="w-full">
            <img
              src={poll.questionMedia.url}
              alt="Poll media"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}

        {/* Options with voting UI - Redesigned with animated percentage bars */}
        <div className="space-y-2">
          {localPoll.options.map((option) => {
            const votesCount = option.votesCount ?? 0;
            const percentage =
              typeof option.percentage === "number"
                ? option.percentage
                : localPoll.totalVotes > 0
                  ? Math.round((votesCount / localPoll.totalVotes) * 100)
                  : 0;
            const isSelected = selectedIndices.includes(option.index);
            const showResults =
              Boolean(localPoll.canViewResults) && resultsVisible;
            const isLocked = !canVote || voting;
            const dimmed = selectedIndices.length > 0 && !isSelected;

            return (
              <button
                key={option.index}
                type="button"
                onClick={() => onVoteOption(option.index)}
                disabled={isLocked}
                className={cn(
                  "relative overflow-hidden rounded-full h-12 w-full text-left transition-all duration-200",
                  !isLocked && "hover:bg-primary/20 cursor-pointer",
                  isLocked && "cursor-default",
                  dimmed && !showResults && "opacity-55",
                  isSelected && "ring-2 ring-primary",
                  isSelected && !isLocked && "scale-[1.01]",
                )}>
                {/* Animated gradient progress bar */}
                <AnimatePresence mode="wait">
                  {showResults && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      exit={{ width: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    />
                  )}
                </AnimatePresence>

                {/* Option content with right-aligned percentage */}
                <div className="relative z-10 px-4 flex items-center justify-between h-full">
                  <span
                    className={cn(
                      "text-sm",
                      isSelected && "font-semibold",
                      showResults &&
                        percentage > 50 &&
                        "text-primary-foreground",
                    )}>
                    {option.text}
                    {isSelected && " ✓"}
                  </span>
                  {showResults && (
                    <span
                      className={cn(
                        "text-sm font-medium ml-2",
                        percentage > 50
                          ? "text-primary-foreground"
                          : "text-muted-foreground",
                      )}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Poll metadata - Redesigned */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          {Boolean(localPoll.canViewResults) && resultsVisible && (
            <span className="font-medium">
              {localPoll.totalVotes} vote{localPoll.totalVotes !== 1 ? "s" : ""}
            </span>
          )}
          {expiresLabel && (
            <>
              <span>·</span>
              <span>{expiresLabel}</span>
            </>
          )}
          {!localPoll.canViewResults && (
            <>
              <span>·</span>
              <span className="italic">Vote to see results</span>
            </>
          )}
        </div>
      </div>
    </CardContent>
  );
}
