import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { FaUsers } from "react-icons/fa";

import {
  Bookmark,
  EyeOff,
  Info,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === poll.author.clerkId;
  const canManage = isOwner;
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

  const cannotEditReason =
    poll.totalVotes > 0 ? "votes cast" : isExpired ? "poll expired" : null;
  const cannotEdit = cannotEditReason !== null;

  const statusLines = (() => {
    if (isActive) {
      if (hasValidExpiresAt && expiresAtDate)
        return { primary: formatExpiresIn(expiresAtDate) };
      return { primary: "Active" };
    }

    return {
      primary: "Expired (can't vote)",
      secondary: poll.canViewResults ? "Results unlocked" : undefined,
    };
  })();

  const badgeTitle = (() => {
    if (isActive && !hasValidExpiresAt) return "No expiry";
    if (isActive) return undefined;

    const fallbackDate = new Date(poll.updatedAt || poll.createdAt);
    const d = hasValidExpiresAt && expiresAtDate ? expiresAtDate : fallbackDate;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  })();

  const badgeClassName = isActive
    ? "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shadow-sm transition-all hover:bg-emerald-500/15 focus:ring-0 focus:ring-offset-0"
    : "gap-1.5 border-border/60 bg-muted/50 text-muted-foreground shadow-sm transition-all hover:bg-muted/80 focus:ring-0 focus:ring-offset-0";

  const badgeDotClassName = isActive
    ? "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
    : "h-1.5 w-1.5 rounded-full bg-muted-foreground/50";

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

  const hasUserVoted = selectedIndices.length > 0;

  const { bookmarked, bookmarkPending, toggleBookmark } = usePollBookmark(
    poll.id,
  );

  const { userReaction, reactionPending, reactionCount, handleSelectReaction } =
    usePollReactions(poll.id, poll.reactionsCount || 0);

  const handleEdit = () => {
    if (cannotEdit) {
      if (cannotEditReason === "votes cast") {
        toast.error("You can't edit a poll after votes have been cast");
      } else {
        toast.error("You can't edit an expired poll");
      }
      return;
    }
    navigate(`/app/polls/${poll.id}/edit`);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(poll.id);
    setIsDeleteDialogOpen(false);
  };

  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground transition-all duration-200 hover:text-foreground";

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <Card
          className={cn(
            "bg-card border border-border/40 rounded-3xl overflow-hidden shadow-card",
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
                      className="h-11 w-11 rounded-full object-cover border-2 border-background shadow-sm"
                    />
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-foreground leading-tight truncate">
                        {displayName}
                      </div>
                      <div className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                        {timeAgoShort(poll.createdAt)}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName} title={badgeTitle}>
                      <span className={badgeDotClassName} />
                      <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-[12px] font-semibold">
                          {statusLines.primary}
                        </span>
                        {statusLines.secondary && (
                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/70">
                            {statusLines.secondary}
                          </span>
                        )}
                      </div>
                    </Badge>

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Poll options">
                            <MoreHorizontal
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[180px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-dropdown">
                          <DropdownMenuItem
                            onClick={handleEdit}
                            disabled={cannotEdit}
                            title={
                              cannotEdit
                                ? cannotEditReason === "votes cast"
                                  ? "Edit locked: votes have been cast"
                                  : "Edit locked: poll is expired"
                                : undefined
                            }
                            className="gap-2 rounded-lg px-3 py-2 hover:bg-accent focus:bg-accent">
                            <Pencil
                              className="h-4 w-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0 leading-tight">
                              <span>Edit poll</span>
                              {cannotEdit && (
                                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/40">
                                  Locked: {cannotEditReason}
                                </span>
                              )}
                            </div>
                          </DropdownMenuItem>

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                                onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Delete poll
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )}

              {!hasAvatar && (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className={cn("min-w-0", !subtitle && "text-center")}>
                    <div className="text-[14px] font-bold text-foreground leading-tight truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                      {timeAgoShort(poll.createdAt)}
                    </div>
                    {subtitle && (
                      <div className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                        {subtitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={badgeClassName} title={badgeTitle}>
                      <span className={badgeDotClassName} />
                      <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-[12px] font-semibold">
                          {statusLines.primary}
                        </span>
                        {statusLines.secondary && (
                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/70">
                            {statusLines.secondary}
                          </span>
                        )}
                      </div>
                    </Badge>

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40"
                            aria-label="Poll options">
                            <MoreHorizontal
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[180px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-dropdown">
                          <DropdownMenuItem
                            onClick={handleEdit}
                            disabled={cannotEdit}
                            title={
                              cannotEdit
                                ? cannotEditReason === "votes cast"
                                  ? "Edit locked: votes have been cast"
                                  : "Edit locked: poll is expired"
                                : undefined
                            }
                            className="gap-2 rounded-lg px-3 py-2 hover:bg-accent focus:bg-accent">
                            <Pencil
                              className="h-4 w-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0 leading-tight">
                              <span>Edit poll</span>
                              {cannotEdit && (
                                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/40">
                                  Locked: {cannotEditReason}
                                </span>
                              )}
                            </div>
                          </DropdownMenuItem>

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                                onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                Delete poll
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={cn("mt-4", hasAvatar ? "" : "mt-5")}>
              <h3 className="text-[15px] font-bold text-foreground leading-snug">
                {poll.question}
              </h3>
            </div>

            {hasMedia && (
              <div className="mt-4">
                <img
                  src={mediaUrl!}
                  alt=""
                  className="w-full h-64 object-cover rounded-2xl border border-border/40"
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

            <div className="border-t border-border/40 pt-4 mt-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-4">
                  <HeartReactionButton
                    liked={Boolean(userReaction)}
                    filled={reactionCount > 0}
                    count={reactionCount}
                    pending={reactionPending}
                    onToggle={() => void handleSelectReaction("love")}
                    ariaLabel={`React to poll. ${reactionCount} reactions`}
                    className={cn(
                      actionBase,
                      "hover:bg-red-500/10 hover:text-red-500",
                    )}
                    countClassName="text-xs font-bold text-muted-foreground"
                  />

                  {hasUserVoted && (
                    <div
                      className={cn(
                        actionBase,
                        "cursor-default hover:bg-accent",
                      )}>
                      <FaUsers className="h-4 w-4" />
                      <span className="text-[12px] font-bold tabular-nums">
                        {localPoll.totalVotes}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {poll.settings.anonymousVoting && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-primary text-[11px] font-bold tracking-wide">
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                      <span>ANONYMOUS</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={toggleBookmark}
                    disabled={bookmarkPending}
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      bookmarked
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10",
                    )}
                    aria-label={
                      bookmarked ? "Remove bookmark" : "Bookmark poll"
                    }
                    title={bookmarked ? "Remove bookmark" : "Bookmark"}>
                    <Bookmark
                      className={cn("h-4 w-4", bookmarked && "fill-current")}
                    />
                  </button>
                </div>
              </div>
            </div>

            {isActive && !poll.canViewResults && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/90 leading-tight truncate">
                      Vote to see the results
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
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
