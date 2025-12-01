import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, MessageCircle, Share2, Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Poll } from "@/types/poll";
import toast from "react-hot-toast";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";
import { BookmarkService } from "@/services/bookmarkService";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { PollService } from "@/services/pollService";
import { motion, AnimatePresence } from "framer-motion";

interface PollCardProps {
  poll: Poll;
  onDelete?: (pollId: string) => void;
  onUpdate?: (updatedPoll: Poll) => void;
  className?: string;
}

export function PollCard({
  poll,
  onDelete,
  onUpdate,
  className,
}: PollCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === poll.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(
    poll.reactionsCount || 0
  );
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionType, number>
  >({
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  });
  const [bookmarked, setBookmarked] = useState(false);

  // Local poll state for optimistic updates
  const [localPoll, setLocalPoll] = useState<Poll>(poll);
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    poll.userVote || []
  );
  const [voting, setVoting] = useState(false);

  const displayName = poll.author.username;

  // Update local state when poll prop changes
  useEffect(() => {
    setLocalPoll(poll);
    setSelectedIndices(poll.userVote || []);
  }, [poll]);

  // Check if poll can be voted on
  const canVote = useMemo(() => {
    if (localPoll.status !== "active") return false;
    if (localPoll.expiresAt && new Date(localPoll.expiresAt) < new Date())
      return false;
    return true;
  }, [localPoll.status, localPoll.expiresAt]);

  const reactionEmojiMap: Record<ReactionType, string> = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😡",
  };
  const selectedEmoji = userReaction ? reactionEmojiMap[userReaction] : "👍";

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(poll.id);
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    // Initialize bookmark state
    setBookmarked(BookmarkService.isBookmarked(poll.id));

    // Fetch user reaction for this poll
    (async () => {
      try {
        const res = await ReactionService.getByContent("poll", poll.id);
        if (!cancelled && res.success && res.data) {
          const ur = res.data.userReaction;
          setUserReaction(ur ? ur.type : null);
          if (typeof res.data.totalCount === "number") {
            setReactionCount(res.data.totalCount);
          }

          if (Array.isArray(res.data.reactionCounts)) {
            const nextCounts: Record<ReactionType, number> = {
              like: 0,
              love: 0,
              laugh: 0,
              wow: 0,
              sad: 0,
              angry: 0,
            };
            for (const rc of res.data.reactionCounts) {
              nextCounts[rc.type] = rc.count;
            }
            setReactionCounts(nextCounts);
          }
        }
      } catch {
        // Silent fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [poll.id]);

  const handleCopyLink = async () => {
    const path = `/app/polls/${poll.id}`;
    const url = `${window.location.origin}${path}`;

    try {
      const shareFn = (
        navigator as unknown as {
          share?: (data: {
            url?: string;
            title?: string;
            text?: string;
          }) => Promise<void>;
        }
      ).share;
      if (typeof shareFn === "function") {
        await shareFn({ url, title: poll.question });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Poll link copied to clipboard");
      }
    } catch (e) {
      console.error("Failed to copy link:", e);
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/polls/${poll.id}/edit`);
  };

  const handleSelectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount;
    const prevCounts = reactionCounts;

    const nextCounts: Record<ReactionType, number> = { ...prevCounts };
    if (prevType === type) {
      // Remove existing reaction of same type
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
      setUserReaction(null);
    } else {
      // If switching from another type, decrement that first
      if (prevType) {
        nextCounts[prevType] = Math.max(0, (nextCounts[prevType] ?? 0) - 1);
      }
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
      setUserReaction(type);
    }

    const nextTotal = (Object.values(nextCounts) as number[]).reduce(
      (sum, value) => sum + value,
      0
    );
    setReactionCounts(nextCounts);
    setReactionCount(nextTotal);

    try {
      const res = await ReactionService.toggle("poll", poll.id, type);
      if (!res.success) throw new Error(res.message || "Failed to react");

      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (err: unknown) {
      // Revert on error
      setUserReaction(prevType);
      setReactionCounts(prevCounts);
      setReactionCount(prevCount);
      let msg = "Failed to update reaction";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      toast.error(msg);
    } finally {
      setReactionPending(false);
    }
  };

  const handleToggleBookmark = () => {
    const next = BookmarkService.toggle(poll.id);
    setBookmarked(next);
    toast[next ? "success" : "success"](
      next ? "Saved to bookmarks" : "Removed from bookmarks"
    );
  };

  const toggleSelection = (index: number) => {
    if (!canVote) return;

    if (localPoll.settings.allowMultiple) {
      setSelectedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleVote = async () => {
    if (!canVote || voting) return;
    if (selectedIndices.length === 0) {
      toast.error("Please select at least one option");
      return;
    }

    try {
      setVoting(true);

      // Optimistic update
      const optimisticPoll = { ...localPoll };
      const oldUserVote = optimisticPoll.userVote || [];
      optimisticPoll.userVote = selectedIndices;

      // Calculate new vote counts optimistically
      const newOptions = optimisticPoll.options.map((opt, idx) => {
        let newVotesCount = opt.votesCount ?? 0;

        // Remove old votes
        if (oldUserVote.includes(idx)) {
          newVotesCount = Math.max(0, newVotesCount - 1);
        }

        // Add new votes
        if (selectedIndices.includes(idx)) {
          newVotesCount += 1;
        }

        return { ...opt, votesCount: newVotesCount };
      });

      // Calculate new total
      const newTotal = newOptions.reduce(
        (sum, opt) => sum + (opt.votesCount ?? 0),
        0
      );

      // Calculate percentages
      const optionsWithPercentages = newOptions.map((opt) => ({
        ...opt,
        percentage:
          newTotal > 0
            ? Math.round(((opt.votesCount ?? 0) / newTotal) * 100)
            : 0,
      }));

      optimisticPoll.options = optionsWithPercentages;
      optimisticPoll.totalVotes = newTotal;
      optimisticPoll.canViewResults = true;

      setLocalPoll(optimisticPoll);

      // Make API call
      const res = await PollService.vote(poll.id, {
        optionIndices: selectedIndices,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to submit vote");
      }

      // Update with server response
      setLocalPoll(res.data);
      setSelectedIndices(res.data.userVote || []);

      if (onUpdate) {
        onUpdate(res.data);
      }

      toast.success("Vote recorded!");
    } catch (err: unknown) {
      console.error(err);
      // Revert optimistic update
      setLocalPoll(poll);
      setSelectedIndices(poll.userVote || []);

      let msg = "Failed to submit vote";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      toast.error(msg);
    } finally {
      setVoting(false);
    }
  };

  const handleRemoveVote = async () => {
    if (voting) return;

    try {
      setVoting(true);

      // Optimistic update
      const optimisticPoll = { ...localPoll };
      const oldUserVote = optimisticPoll.userVote || [];
      optimisticPoll.userVote = [];

      // Calculate new vote counts optimistically
      const newOptions = optimisticPoll.options.map((opt, idx) => {
        let newVotesCount = opt.votesCount ?? 0;

        // Remove old votes
        if (oldUserVote.includes(idx)) {
          newVotesCount = Math.max(0, newVotesCount - 1);
        }

        return { ...opt, votesCount: newVotesCount };
      });

      // Calculate new total
      const newTotal = newOptions.reduce(
        (sum, opt) => sum + (opt.votesCount ?? 0),
        0
      );

      // Calculate percentages
      const optionsWithPercentages = newOptions.map((opt) => ({
        ...opt,
        percentage:
          newTotal > 0
            ? Math.round(((opt.votesCount ?? 0) / newTotal) * 100)
            : 0,
      }));

      optimisticPoll.options = optionsWithPercentages;
      optimisticPoll.totalVotes = newTotal;

      setLocalPoll(optimisticPoll);
      setSelectedIndices([]);

      // Make API call
      const res = await PollService.removeVote(poll.id);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to remove vote");
      }

      // Update with server response
      setLocalPoll(res.data);
      setSelectedIndices(res.data.userVote || []);

      if (onUpdate) {
        onUpdate(res.data);
      }

      toast.success("Vote removed");
    } catch (err: unknown) {
      console.error(err);
      // Revert optimistic update
      setLocalPoll(poll);
      setSelectedIndices(poll.userVote || []);

      let msg = "Failed to remove vote";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      toast.error(msg);
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <Card className={cn("w-full", className)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              {/* Author info */}
              <Link
                to={`/app/profile/${poll.author.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={poll.author.profileImage} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {displayName.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm truncate max-w-[180px]">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{poll.author.username}
                    <span className="mx-1">·</span>
                    {timeAgo(poll.createdAt)}
                  </p>
                </div>
              </Link>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/app/polls/${poll.id}`}>View poll</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    Copy link
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        Edit poll
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}>
                        Delete poll
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <>
                      <DropdownMenuItem>Report poll</DropdownMenuItem>
                      <DropdownMenuItem>
                        Block {poll.author.username}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {/* Poll content */}
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
                      onClick={() => toggleSelection(option.index)}
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
                    onClick={handleVote}
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
                      onClick={handleRemoveVote}
                      disabled={voting}>
                      Remove Vote
                    </Button>
                  )}
                </div>
              )}

              {/* Poll metadata - Redesigned */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <span className="font-medium">
                  {localPoll.totalVotes} vote
                  {localPoll.totalVotes !== 1 ? "s" : ""}
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

          {/* Interaction buttons */}
          <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t">
            <div className="flex items-center gap-1">
              <ReactionPicker
                onSelect={handleSelectReaction}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={reactionPending}
                    className={cn(
                      "gap-2 text-muted-foreground",
                      userReaction ? "text-pink-600" : "hover:text-pink-600"
                    )}>
                    <span className="text-sm">{selectedEmoji}</span>
                    <span className="text-xs">{reactionCount}</span>
                  </Button>
                }
              />
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {(Object.keys(reactionCounts) as ReactionType[]).map((type) => {
                  const count = reactionCounts[type] ?? 0;
                  if (!count) return null;
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                      <span>{reactionEmojiMap[type]}</span>
                      <span>{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-blue-600"
                asChild>
                <Link to={`/app/polls/${poll.id}`}>
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{poll.commentsCount || 0}</span>
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 text-muted-foreground hover:text-green-600">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleBookmark}
                className={cn(
                  "gap-2 text-muted-foreground",
                  bookmarked ? "text-amber-600" : "hover:text-amber-600"
                )}>
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
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
