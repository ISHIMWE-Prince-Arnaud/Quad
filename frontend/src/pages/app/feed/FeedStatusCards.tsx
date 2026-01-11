import { Link } from "react-router-dom";

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
        <CardContent className="pt-6 text-center">
          <p className="text-[#94a3b8] mb-4">{error}</p>
          <Button onClick={onRetry}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!loading && !error && itemsLength === 0) {
    return (
      <Card className="shadow-sm bg-[#0f121a] border border-white/5 rounded-[2rem]">
        <CardContent className="pt-6 text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-white">
            {emptyState.title}
          </h3>
          <p className="text-[#94a3b8] mb-4">{emptyState.description}</p>
          {emptyState.actionLabel && emptyState.actionHref && (
            <Button asChild>
              <Link to={emptyState.actionHref}>{emptyState.actionLabel}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
