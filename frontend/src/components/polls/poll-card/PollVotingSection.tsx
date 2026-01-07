import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { Poll } from "@/types/poll";

export function PollVotingSection({
  poll,
  localPoll,
  selectedIndices,
  canVote,
  voting,
  onToggleSelection,
  onVote,
  onRemoveVote,
}: {
  poll: Poll;
  localPoll: Poll;
  selectedIndices: number[];
  canVote: boolean;
  voting: boolean;
  onToggleSelection: (index: number) => void;
  onVote: () => void;
  onRemoveVote: () => void;
}) {
  return (
    <CardContent className="pb-3 space-y-3">
      <div className="space-y-3">
        {/* Question */}
        <Link to={`/app/polls/${poll.id}`}>
          <h3 className="font-semibold text-base hover:underline">
            {poll.question}
          </h3>
        </Link>

        {/* Question media */}
        {poll.questionMedia && (
          <div className="w-full">
            {poll.questionMedia.type === "image" ? (
              <img
                src={poll.questionMedia.url}
                alt="Poll media"
                className="w-full h-48 object-cover rounded-md"
              />
            ) : (
              <video
                src={poll.questionMedia.url}
                className="w-full h-48 object-cover rounded-md"
                controls
              />
            )}
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

            return (
              <button
                key={option.index}
                type="button"
                onClick={() => onToggleSelection(option.index)}
                disabled={!canVote}
                className={cn(
                  "relative overflow-hidden rounded-full h-12 w-full text-left transition-all duration-200",
                  canVote && "hover:bg-primary/20 cursor-pointer",
                  !canVote && "cursor-default",
                  isSelected && canVote && "ring-2 ring-primary"
                )}>
                {/* Animated gradient progress bar */}
                <AnimatePresence mode="wait">
                  {localPoll.canViewResults && (
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
                      localPoll.canViewResults &&
                        percentage > 50 &&
                        "text-primary-foreground"
                    )}>
                    {option.text}
                    {isSelected && " ✓"}
                  </span>
                  {localPoll.canViewResults && (
                    <span
                      className={cn(
                        "text-sm font-medium ml-2",
                        percentage > 50
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      )}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote button */}
        {canVote && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onVote}
              disabled={voting || selectedIndices.length === 0}
              className="flex-1">
              {voting
                ? "Voting..."
                : localPoll.userVote && localPoll.userVote.length > 0
                  ? "Change Vote"
                  : "Vote"}
            </Button>
            {localPoll.userVote && localPoll.userVote.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRemoveVote}
                disabled={voting}>
                Remove Vote
              </Button>
            )}
          </div>
        )}

        {/* Poll metadata - Redesigned */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <span className="font-medium">
            {localPoll.totalVotes} vote{localPoll.totalVotes !== 1 ? "s" : ""}
          </span>
          {localPoll.expiresAt && (
            <>
              <span>·</span>
              <span>
                {new Date(localPoll.expiresAt) > new Date()
                  ? `${timeAgo(localPoll.expiresAt)} left`
                  : "Expired"}
              </span>
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
