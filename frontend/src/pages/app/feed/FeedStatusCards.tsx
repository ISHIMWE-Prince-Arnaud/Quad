import { Link } from "react-router-dom";
import { PiWarningCircleBold, PiSparkleBold } from "react-icons/pi";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <Card className="shadow-card bg-card border border-border/40 rounded-[2rem]">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 grid place-items-center">
              <PiWarningCircleBold className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Something went wrong
            </h3>
            <p className="text-muted-foreground/70 mb-6 max-w-md mx-auto">
              {error}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button onClick={onRetry}>Try Again</Button>
              <Button asChild variant="outline">
                <Link to="/app/feed">Go to Feed</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!loading && !error && itemsLength === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <Card className="shadow-card bg-card border border-border/40 rounded-[2rem]">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center">
              <PiSparkleBold className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              {emptyState.title}
            </h3>
            <p className="text-muted-foreground/70 mb-6 max-w-md mx-auto">
              {emptyState.description}
            </p>

            <div className="flex items-center justify-center gap-3">
              {emptyState.actionLabel && emptyState.actionHref && (
                <Button asChild>
                  <Link to={emptyState.actionHref}>
                    {emptyState.actionLabel}
                  </Link>
                </Button>
              )}
              {emptyState.secondaryActionLabel &&
                emptyState.secondaryActionHref && (
                  <Button asChild variant="outline">
                    <Link to={emptyState.secondaryActionHref}>
                      {emptyState.secondaryActionLabel}
                    </Link>
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
