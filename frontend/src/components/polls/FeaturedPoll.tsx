import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PollService } from "@/services/pollService";
import type { Poll } from "@/types/poll";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/errorHandling";

interface FeaturedPollProps {
  className?: string;
}

const OPTION_PREVIEW_COUNT = 3;

export function FeaturedPoll({ className }: FeaturedPollProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoll = async (showSkeleton: boolean) => {
    if (showSkeleton) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await PollService.getAll({
        limit: 1,
        sort: "trending",
        status: "active",
      });

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPoll(res.data[0]);
        setError(null);
      } else {
        setPoll(null);
        setError(null);
      }
    } catch (err) {
      logError(err, { component: "FeaturedPoll", action: "fetchPoll" });
      setError("Unable to load poll");
      setPoll(null);
    } finally {
      if (showSkeleton) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void fetchPoll(true);
    /// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPercentage = (optionVotes?: number) => {
    if (!poll || !poll.canViewResults || !poll.totalVotes) return 0;
    return Math.round(((optionVotes ?? 0) / poll.totalVotes) * 100);
  };

  const renderOptions = () => {
    if (!poll) return null;
    const options = poll.options.slice(0, OPTION_PREVIEW_COUNT);

    return options.map((option) => {
      const percentage = getPercentage(option.votesCount);

      return (
        <div key={option.index} className="space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="truncate">{option.text}</span>
            {poll.canViewResults && <span>{percentage}%</span>}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all",
                !poll.canViewResults && "bg-primary/20"
              )}
              style={{ width: poll.canViewResults ? `${percentage}%` : "12%" }}
            />
          </div>
        </div>
      );
    });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-2 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-9 rounded bg-muted animate-pulse" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>{error}</p>
          <Button size="sm" onClick={() => fetchPoll(true)}>
            Try Again
          </Button>
        </div>
      );
    }

    if (!poll) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>No poll to feature right now.</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/polls">Explore Polls</Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-2">
          <Link
            to={`/app/polls/${poll.id}`}
            className="text-base font-semibold hover:text-primary transition-colors">
            {poll.question}
          </Link>
          <p className="text-xs text-muted-foreground">
            {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
            {poll.expiresAt && (
              <>
                <span className="mx-1">·</span>
                <span>
                  Closes{" "}
                  {new Date(poll.expiresAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-3">{renderOptions()}</div>

        {!poll.canViewResults && (
          <p className="text-xs italic text-muted-foreground">
            Vote to reveal live results
          </p>
        )}
      </>
    );
  };

    <Card className={cn("bg-[#0f121a] border border-white/5 rounded-3xl overflow-hidden shadow-xl", className)}>
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#2563eb]" />
            Trending Poll
          </CardTitle>
          <button
            onClick={() => fetchPoll(false)}
            disabled={isLoading || isRefreshing}
            className="p-2 text-[#64748b] hover:text-white transition-colors"
            aria-label="Refresh poll">
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2 w-full rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : error || !poll ? (
          <div className="py-4 text-center">
            <p className="text-sm text-[#64748b] mb-4">{error || "No trending polls"}</p>
            <Button variant="outline" size="sm" onClick={() => fetchPoll(true)} className="rounded-full border-white/10 text-white">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Link
                to={`/app/polls/${poll.id}`}
                className="text-lg font-bold text-white hover:text-[#2563eb] transition-colors leading-tight">
                {poll.question}
              </Link>
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#64748b]">
                <span>{poll.totalVotes} votes</span>
                <span>·</span>
                <span>{poll.expiresAt ? `Ends ${new Date(poll.expiresAt).toLocaleDateString()}` : "Ongoing"}</span>
              </div>
            </div>

            <div className="space-y-4">
              {poll.options.slice(0, 3).map((option) => {
                const percentage = getPercentage(option.votesCount);
                return (
                  <div key={option.index} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white/90 truncate mr-2">{option.text}</span>
                      <span className="text-[#2563eb]">{percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#9333ea]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button className="w-full rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold h-11 shadow-lg shadow-[#2563eb]/20" asChild>
              <Link to={`/app/polls/${poll.id}`}>Vote now</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
