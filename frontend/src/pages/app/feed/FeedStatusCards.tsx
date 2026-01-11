import { Link } from "react-router-dom";
import { AlertCircle, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedSkeleton } from "@/components/ui/loading";

import type { FeedEmptyState } from "./feedEmptyState";

export function FeedStatusCards({
  loading,
  error,
  itemsLength,
  emptyState,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  itemsLength: number;
  emptyState: FeedEmptyState;
  onRetry: () => void;
}) {
  if (loading && itemsLength === 0) return <FeedSkeleton />;

  if (error && !loading) {
    return (
      <Card className="shadow-sm bg-[#0f121a] border border-white/5 rounded-[2rem]">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 grid place-items-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Something went wrong</h3>
          <p className="text-[#94a3b8] mb-6 max-w-md mx-auto">{error}</p>

          <div className="flex items-center justify-center gap-3">
            <Button onClick={onRetry}>Try Again</Button>
            <Button asChild variant="outline">
              <Link to="/app/feed">Go to Feed</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loading && !error && itemsLength === 0) {
    return (
      <Card className="shadow-sm bg-[#0f121a] border border-white/5 rounded-[2rem]">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#2563eb]/10 border border-[#2563eb]/20 grid place-items-center">
            <Sparkles className="h-6 w-6 text-[#2563eb]" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">{emptyState.title}</h3>
          <p className="text-[#94a3b8] mb-6 max-w-md mx-auto">{emptyState.description}</p>

          <div className="flex items-center justify-center gap-3">
            {emptyState.actionLabel && emptyState.actionHref && (
              <Button asChild>
                <Link to={emptyState.actionHref}>{emptyState.actionLabel}</Link>
              </Button>
            )}
            {emptyState.secondaryActionLabel && emptyState.secondaryActionHref && (
              <Button asChild variant="outline">
                <Link to={emptyState.secondaryActionHref}>
                  {emptyState.secondaryActionLabel}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
