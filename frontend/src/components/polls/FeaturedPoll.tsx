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
      console.error("Failed to load featured poll", err);
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Featured Poll
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => fetchPoll(false)}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh featured poll">
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">{renderBody()}</CardContent>

      {poll && (
        <CardFooter className="pt-0">
          <Button className="w-full" asChild>
            <Link to={`/app/polls/${poll.id}`}>Vote now</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
