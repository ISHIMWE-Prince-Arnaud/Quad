import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import toast from "react-hot-toast";

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

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg font-semibold">
              {poll.question}
            </CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
