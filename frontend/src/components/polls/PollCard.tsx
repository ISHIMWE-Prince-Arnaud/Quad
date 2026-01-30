import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { FaUserCheck } from "react-icons/fa6";

import { Bookmark, EyeOff, Info, MoreHorizontal, Share2 } from "lucide-react";

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
import { cn, copyToClipboard } from "@/lib/utils";
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
  const isExpired = poll.status === "expired" || isExpiredByTime;
  const isActive = poll.status === "active" && !isExpired;

  const statusText = (() => {
    if (isActive) {
      if (hasValidExpiresAt && expiresAtDate)
        return formatExpiresIn(expiresAtDate);
      return "Active";
    }

    const fallbackDate = new Date(poll.updatedAt || poll.createdAt);
    const d = hasValidExpiresAt && expiresAtDate ? expiresAtDate : fallbackDate;
    const dateText = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    return isExpired ? `Expired ${dateText}` : `Closed ${dateText}`;
  })();

  const badgeTitle = isActive && !hasValidExpiresAt ? "No expiry" : undefined;

  const badgeClassName = isActive
    ? "gap-1.5 border-emerald-500/25 bg-emerald-500/15 text-emerald-200 shadow-sm backdrop-blur-sm hover:bg-emerald-500/15 focus:ring-0 focus:ring-offset-0"
    : poll.status === "expired"
      ? "gap-1.5 border-gray-500/25 bg-gray-500/15 text-gray-200 shadow-sm backdrop-blur-sm hover:bg-gray-500/15 focus:ring-0 focus:ring-offset-0"
      : "gap-1.5 border-slate-500/25 bg-slate-500/15 text-slate-200 shadow-sm backdrop-blur-sm hover:bg-slate-500/15 focus:ring-0 focus:ring-offset-0";

  const badgeDotClassName = isActive
    ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
    : poll.status === "expired"
      ? "h-1.5 w-1.5 rounded-full bg-gray-300"
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

  const handleCopyLink = async () => {
    const path = `/app/polls?pollId=${encodeURIComponent(poll.id)}`;
    const url = `${window.location.origin}${path}`;

    const ok = await copyToClipboard(url);
    if (ok) toast.success("Poll link copied to clipboard");
    else toast.error("Failed to copy link");
  };

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
                      <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5 truncate">
                        {timeAgoShort(poll.createdAt)}
                      </div>
                      {subtitle && (
                        <div className="text-[11px] font-medium text-[#94a3b8] truncate max-w-[320px]">
                          {subtitle}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName} title={badgeTitle}>
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
                    <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5 truncate">
                      {timeAgoShort(poll.createdAt)}
                    </div>
                    {subtitle && (
                      <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5 truncate">
                        {subtitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName} title={badgeTitle}>
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

            <div className="border-t border-white/5 pt-4 mt-4">
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center gap-4 justify-start text-[#94a3b8]">
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

                  <button
                    type="button"
                    onClick={toggleBookmark}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      bookmarked
                        ? "text-[#f59e0b] bg-[#f59e0b]/10"
                        : "text-[#94a3b8] hover:text-[#f59e0b] hover:bg-[#f59e0b]/5",
                    )}
                    aria-label={
                      bookmarked ? "Remove bookmark" : "Bookmark poll"
                    }
                    title={bookmarked ? "Remove bookmark" : "Bookmark"}>
                    <Bookmark
                      className={cn("h-4 w-4", bookmarked && "fill-current")}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className={cn(
                      actionBase,
                      "hover:bg-white/5 hover:text-[#10b981]",
                    )}
                    aria-label="Share poll"
                    title="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[#94a3b8]">
                  <FaUserCheck className="h-4 w-4" />
                  <span className="text-[12px] font-medium">
                    {localPoll.totalVotes} vote
                    {localPoll.totalVotes === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 text-[#94a3b8]">
                  {poll.settings.anonymousVoting && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-3 py-1.5 text-white text-[11px] font-bold tracking-wide">
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                      <span>ANONYMOUS</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!poll.canViewResults && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white/90 leading-tight truncate">
                      Vote to see the results
                    </p>
                    <p className="text-[11px] font-medium text-[#94a3b8] leading-tight truncate">
                      Results unlock after you vote.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#10b981] whitespace-nowrap">
                  Tap an option
                </span>
              </div>
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
