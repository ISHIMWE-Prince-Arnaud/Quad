import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Bookmark, EyeOff, MoreHorizontal } from "lucide-react";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Poll } from "@/types/poll";
import type { PollCardProps } from "./poll-card/types";
import { PollOptionBar } from "./poll-card/PollOptionBar";
import { usePollBookmark } from "./poll-card/usePollBookmark";
import { usePollReactions } from "./poll-card/usePollReactions";
import { usePollVoting } from "./poll-card/usePollVoting";

const displayNameFromAuthor = (poll: Poll): string => {
  const first = poll.author.firstName?.trim();
  const last = poll.author.lastName?.trim();
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : poll.author.username;
};

const timeAgoShort = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  if (Number.isNaN(past.getTime())) return "";
  if (diffMs < 60 * 1000) return "now";

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function PollCard({
  poll,
  onDelete,
  onUpdate,
  className,
}: PollCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === poll.author.clerkId;
  const canDelete = Boolean(onDelete) && isOwner;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatExpiresIn = (future: Date): string => {
    const now = new Date();
    const diffMs = future.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const diffMinutes = Math.ceil(diffMs / (60 * 1000));
    const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
    const diffMonths = Math.ceil(diffMs / (30 * 24 * 60 * 60 * 1000));

    if (diffMonths >= 2) return `Expires in ${diffMonths} months`;
    if (diffMonths === 1) return "Expires in 1 month";

    if (diffWeeks >= 2) return `Expires in ${diffWeeks} weeks`;
    if (diffWeeks === 1) return "Expires in 1 week";

    if (diffDays >= 2) return `Expires in ${diffDays} days`;
    if (diffDays === 1) return "Expires in 1 day";

    if (diffHours >= 2) return `Expires in ${diffHours} hours`;
    if (diffHours === 1) return "Expires in 1 hour";

    if (diffMinutes >= 2) return `Expires in ${diffMinutes} minutes`;
    return "Expires in 1 minute";
  };

  const displayName = displayNameFromAuthor(poll);
  const subtitle = poll.author.bio?.trim() || "";
  const hasAvatar = Boolean(poll.author.profileImage);
  const mediaUrl = poll.questionMedia?.url;
  const hasMedia = Boolean(mediaUrl);

  const now = new Date();
  const expiresAtDate = poll.expiresAt ? new Date(poll.expiresAt) : null;
  const hasValidExpiresAt = Boolean(
    expiresAtDate && !Number.isNaN(expiresAtDate.getTime()),
  );
  const isExpiredByTime = Boolean(
    hasValidExpiresAt &&
    expiresAtDate &&
    expiresAtDate.getTime() <= now.getTime(),
  );
  const isActive = poll.status === "active" && !isExpiredByTime;

  const statusText = (() => {
    if (isActive) {
      if (hasValidExpiresAt && expiresAtDate)
        return formatExpiresIn(expiresAtDate);
      return "Expires in 1 day";
    }

    const fallbackDate = new Date(poll.updatedAt || poll.createdAt);
    const d = hasValidExpiresAt && expiresAtDate ? expiresAtDate : fallbackDate;
    const dateText = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    return poll.status === "expired"
      ? `Expired ${dateText}`
      : `Closed ${dateText}`;
  })();

  const badgeClassName = isActive
    ? "gap-1.5 border-emerald-500/25 bg-emerald-500/15 text-emerald-200 shadow-sm backdrop-blur-sm hover:bg-emerald-500/15 focus:ring-0 focus:ring-offset-0"
    : poll.status === "expired"
      ? "gap-1.5 border-purple-500/25 bg-purple-500/15 text-purple-200 shadow-sm backdrop-blur-sm hover:bg-purple-500/15 focus:ring-0 focus:ring-offset-0"
      : "gap-1.5 border-slate-500/25 bg-slate-500/15 text-slate-200 shadow-sm backdrop-blur-sm hover:bg-slate-500/15 focus:ring-0 focus:ring-offset-0";

  const badgeDotClassName = isActive
    ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
    : poll.status === "expired"
      ? "h-1.5 w-1.5 rounded-full bg-purple-300"
      : "h-1.5 w-1.5 rounded-full bg-slate-300";

  const {
    localPoll,
    selectedIndices,
    voting,
    canVote,
    resultsVisible,
    voteOnOption,
  } = usePollVoting(poll, onUpdate);

  const showResults = Boolean(localPoll.canViewResults) && resultsVisible;
  const isLocked = !canVote || voting;

  const { bookmarked, toggleBookmark } = usePollBookmark(poll.id);

  const { userReaction, reactionPending, reactionCount, handleSelectReaction } =
    usePollReactions(poll.id, poll.reactionsCount || 0);

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(poll.id);
    setIsDeleteDialogOpen(false);
  };

  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748b] transition-all";

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <Card
          className={cn(
            "bg-[#0f121a] border border-white/5 rounded-3xl overflow-hidden shadow-xl",
            className,
          )}>
          <CardContent className="p-6">
            <div
              className={cn(
                "flex flex-col",
                hasAvatar ? "items-start" : "items-center text-center",
              )}>
              {hasAvatar && (
                <div className="flex items-center justify-between gap-3 w-full">
                  <Link
                    to={`/app/profile/${poll.author.username}`}
                    className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
                    <img
                      src={poll.author.profileImage}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover border-2 border-white/10 shadow-inner"
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-white leading-tight truncate">
                        {displayName}
                      </div>
                      {subtitle && (
                        <div className="text-[11px] font-medium text-[#94a3b8] truncate max-w-[320px]">
                          {subtitle}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName}>
                      <span className={badgeDotClassName} />
                      <span className="whitespace-nowrap">{statusText}</span>
                    </Badge>

                    {canDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#64748b] hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}>
                            Delete poll
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )}

              {!hasAvatar && (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className={cn("min-w-0", !subtitle && "text-center")}>
                    <div className="text-[14px] font-bold text-white leading-tight truncate">
                      {displayName}
                    </div>
                    {subtitle && (
                      <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5 truncate">
                        {subtitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName}>
                      <span className={badgeDotClassName} />
                      <span className="whitespace-nowrap">{statusText}</span>
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className={cn("mt-4", hasAvatar ? "" : "mt-5")}>
              <h3 className="text-[15px] font-bold text-white leading-snug">
                {poll.question}
              </h3>
            </div>

            {hasMedia && (
              <div className="mt-4">
                <img
                  src={mediaUrl!}
                  alt=""
                  className="w-full h-64 object-cover rounded-2xl border border-white/5"
                />
              </div>
            )}

            {localPoll.options.length > 0 && (
              <div className="mt-4 space-y-3">
                {localPoll.options.slice(0, 4).map((opt, idx) => {
                  const optionIndex =
                    typeof opt.index === "number" ? opt.index : idx;
                  const selected = selectedIndices.includes(optionIndex);
                  const dimmed = selectedIndices.length > 0 && !selected;

                  return (
                    <PollOptionBar
                      key={String(opt.index ?? idx)}
                      option={opt}
                      totalVotes={localPoll.totalVotes}
                      showResults={showResults}
                      selected={selected}
                      dimmed={showResults ? false : dimmed}
                      disabled={isLocked}
                      onClick={() => void voteOnOption(optionIndex)}
                    />
                  );
                })}
              </div>
            )}

            <div
              className={cn(
                "flex items-center justify-between border-t border-white/5 pt-4",
                hasMedia ? "mt-4" : "mt-4",
              )}>
              <div className="flex items-center gap-6 text-[#94a3b8]">
                <HeartReactionButton
                  liked={Boolean(userReaction)}
                  filled={reactionCount > 0}
                  count={reactionCount}
                  pending={reactionPending}
                  onToggle={() => void handleSelectReaction("love")}
                  ariaLabel={`React to poll. ${reactionCount} reactions`}
                  className={cn(actionBase, "hover:bg-white/5")}
                  countClassName="text-xs font-bold text-[#64748b]"
                />
              </div>

              <div className="flex items-center gap-3 text-[#94a3b8]">
                {poll.settings.anonymousVoting && (
                  <div className="flex items-center gap-2 text-[12px] font-medium">
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    Anonymous
                  </div>
                )}
                <span className="text-[12px] font-medium">
                  {timeAgoShort(poll.createdAt)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleBookmark}
                  className={cn(
                    "h-9 w-9 p-0",
                    bookmarked
                      ? "text-amber-600"
                      : "text-[#94a3b8] hover:text-amber-600",
                  )}>
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!poll.canViewResults && (
              <p className="mt-3 text-[12px] font-medium text-[#94a3b8]">
                Vote to see results.
              </p>
            )}

            {showResults && (
              <p className="mt-3 text-[12px] font-medium text-[#94a3b8]">
                {localPoll.totalVotes} vote
                {localPoll.totalVotes === 1 ? "" : "s"}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete poll?"
        description="This action cannot be undone. This will permanently delete your poll."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
