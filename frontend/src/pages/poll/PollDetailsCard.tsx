import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import type { Poll } from "@/types/poll";
import type { ReactionType } from "@/services/reactionService";

export function PollDetailsCard({
  poll,
  isOwner,
  selectedIndices,
  canVote,
  voting,
  onToggleSelection,
  onVote,
  onEdit,
  onRequestDelete,
  userReaction,
  totalReactions,
  onSelectReaction,
}: {
  poll: Poll;
  isOwner: boolean;
  selectedIndices: number[];
  canVote: boolean;
  voting: boolean;
  onToggleSelection: (index: number) => void;
  onVote: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
  userReaction: ReactionType | null;
  totalReactions: number;
  onSelectReaction: (type: ReactionType) => void;
}) {
  const hasVoted = (poll.userVote?.length ?? 0) > 0;

  const renderOptionRow = (optionIndex: number) => {
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
        onClick={() => onToggleSelection(optionIndex)}
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

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{poll.question}</CardTitle>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>Edit poll</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onRequestDelete}>
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
          {poll.expiresAt && <span>Expires {new Date(poll.expiresAt).toLocaleString()}</span>}
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

        <div className="space-y-2">{poll.options.map((_, idx) => renderOptionRow(idx))}</div>

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
          <Button type="button" disabled={!canVote || voting} onClick={onVote}>
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
            <HeartReactionButton
              liked={Boolean(userReaction)}
              count={totalReactions}
              onToggle={() => onSelectReaction("love")}
              ariaLabel={`React to poll. ${totalReactions} reactions`}
            />
            <div className="text-sm text-muted-foreground">{totalReactions} reactions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
