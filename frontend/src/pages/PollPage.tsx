import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { ReactionService, type ReactionType } from "@/services/reactionService";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

const reactionEmojiMap: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
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
  const totalReactions = useMemo(
    () =>
      (Object.values(reactionCounts) as number[]).reduce((a, b) => a + b, 0),
    [reactionCounts]
  );

  const canVote = useMemo(() => {
    if (!poll) return false;
    if (poll.status !== "active") return false;
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) return false;
    return true;
  }, [poll]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await PollService.getById(id);
        if (!cancelled && res.success && res.data) {
          setPoll(res.data);
          setSelectedIndices(res.data.userVote || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await ReactionService.getByContent("poll", id);
        if (!cancelled && res.success && res.data) {
          const next: Record<ReactionType, number> = {
            like: 0,
            love: 0,
            laugh: 0,
            wow: 0,
            sad: 0,
            angry: 0,
          };
          for (const rc of res.data.reactionCounts) {
            next[rc.type] = rc.count;
          }
          setReactionCounts(next);
          setUserReaction(
            (res.data.userReaction?.type as ReactionType) || null
          );
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSelectReaction = async (type: ReactionType) => {
    if (!id) return;
    const prevType = userReaction;
    const prevCounts = { ...reactionCounts };

    const nextCounts: Record<ReactionType, number> = { ...prevCounts };
    if (prevType === type) {
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
      setUserReaction(null);
    } else {
      if (prevType) {
        nextCounts[prevType] = Math.max(0, (nextCounts[prevType] ?? 0) - 1);
      }
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
      setUserReaction(type);
    }
    setReactionCounts(nextCounts);

    try {
      if (prevType === type) {
        const res = await ReactionService.remove("poll", id);
        if (!res.success) throw new Error(res.message || "Failed to remove");
      } else {
        const res = await ReactionService.toggle("poll", id, type);
        if (!res.success) throw new Error(res.message || "Failed to react");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reaction");
      setReactionCounts(prevCounts);
      setUserReaction(prevType);
    }
  };

  const toggleSelection = (index: number) => {
    if (!poll) return;
    if (poll.settings.allowMultiple) {
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
    if (!id || !poll) return;
    if (!canVote) return;
    if (selectedIndices.length === 0) {
      toast.error("Select at least one option");
      return;
    }
    try {
      setVoting(true);
      const res = await PollService.vote(id, {
        optionIndices: selectedIndices,
      });
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to submit vote");
        return;
      }
      setPoll(res.data);
      setSelectedIndices(res.data.userVote || []);
      toast.success("Vote recorded");
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      const res = await PollService.delete(id);
      if (res.success) {
        toast.success("Poll deleted successfully");
        navigate("/app/polls");
      } else {
        toast.error(res.message || "Failed to delete poll");
      }
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/app/polls/${id}/edit`);
  };

  const renderOptionRow = (optionIndex: number) => {
    if (!poll) return null;
    const opt = poll.options[optionIndex];
    if (!opt) return null;
    const isSelected = selectedIndices.includes(optionIndex);
    const votesCount = opt.votesCount ?? 0;
    const percentage =
      typeof opt.percentage === "number"
        ? opt.percentage
        : poll.totalVotes > 0
        ? Math.round((votesCount / poll.totalVotes) * 100)
        : 0;

    return (
      <button
        key={optionIndex}
        type="button"
        className="w-full space-y-1 rounded-md border px-3 py-2 text-left transition hover:bg-muted/60"
        onClick={() => toggleSelection(optionIndex)}
        disabled={!canVote}>
        <div className="flex items-center justify-between text-sm">
          <span className="truncate">
            {opt.text}
            {isSelected && " "}
          </span>
          {poll.canViewResults && (
            <span className="text-xs text-muted-foreground">
              {percentage}% ({votesCount})
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${poll.canViewResults ? percentage : 0}%` }}
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading poll...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!poll) return null;

  const hasVoted = (poll.userVote?.length ?? 0) > 0;
  const isOwner = user?.clerkId === poll.author.clerkId;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold">
                {poll.question}
              </CardTitle>
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      Edit poll
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}>
                      Delete poll
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>by {poll.author.username}</span>
              <span>
                {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
              </span>
              {poll.expiresAt && (
                <span>Expires {new Date(poll.expiresAt).toLocaleString()}</span>
              )}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide">
                {poll.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 pb-5">
            {poll.questionMedia && (
              <div className="overflow-hidden rounded-lg">
                {poll.questionMedia.type === "image" ? (
                  <img
                    src={poll.questionMedia.url}
                    alt="Poll"
                    className="h-auto w-full max-h-80 object-cover"
                  />
                ) : (
                  <video
                    src={poll.questionMedia.url}
                    controls
                    className="h-auto w-full max-h-80 object-contain"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              {poll.options.map((_, idx) => renderOptionRow(idx))}
            </div>

            {!poll.canViewResults && (
              <p className="text-xs text-muted-foreground">
                Results are hidden until you vote or the poll expires.
              </p>
            )}

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {poll.settings.allowMultiple
                  ? "You can select multiple options."
                  : "Single-choice poll."}
              </span>
              {hasVoted && <span>You have voted on this poll.</span>}
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                disabled={!canVote || voting}
                onClick={() => void handleVote()}>
                {voting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Voting...
                  </>
                ) : canVote ? (
                  hasVoted ? (
                    "Vote again"
                  ) : (
                    "Vote"
                  )
                ) : (
                  "Voting closed"
                )}
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <ReactionPicker
                  onSelect={(type) => void handleSelectReaction(type)}
                  trigger={
                    <Button
                      variant={userReaction ? "secondary" : "outline"}
                      size="sm">
                      {userReaction
                        ? `Reacted ${reactionEmojiMap[userReaction]}`
                        : "React"}
                    </Button>
                  }
                />
                <div className="text-sm text-muted-foreground">
                  {totalReactions} reactions
                </div>
              </div>
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
          </CardContent>
        </Card>

        <CommentsSection contentType="poll" contentId={poll.id} />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete poll?"
        description="This action cannot be undone. This will permanently delete your poll, all votes, and comments."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
