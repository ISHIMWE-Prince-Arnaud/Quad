import { Link } from "react-router-dom";
import { PiWarningCircleBold, PiSparkleBold } from "react-icons/pi";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
        <EmptyState
          icon={<PiWarningCircleBold className="h-8 w-8 text-destructive" />}
          title="Something went wrong"
          description={error}>
          <Button
            onClick={onRetry}
            className="rounded-full shadow-md font-bold px-8">
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full shadow-sm font-bold px-6">
            <Link to="/app/feed">Go to Feed</Link>
          </Button>
        </EmptyState>
      </motion.div>
    );
  }

  if (!loading && !error && itemsLength === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <EmptyState
          icon={<PiSparkleBold className="h-8 w-8 text-primary" />}
          title={emptyState.title}
          description={emptyState.description}
          actionLabel={emptyState.actionLabel}
          actionHref={emptyState.actionHref}
          secondaryActionLabel={emptyState.secondaryActionLabel}
          secondaryActionHref={emptyState.secondaryActionHref}
        />
      </motion.div>
    );
  }

  return null;
}
