import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Poll } from "@/types/poll";

import { PollOptionBar } from "./PollOptionBar";

const formatExpiresIn = (future: Date): string => {
  const now = new Date();
  const diffMs = future.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffMinutes = Math.ceil(diffMs / (60 * 1000));
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  const diffMonths = Math.ceil(diffMs / (30 * 24 * 60 * 60 * 1000));

  if (diffMonths >= 2) return `Expires in ${diffMonths} months`;
  if (diffMonths === 1) return "Expires in 1 month";

  if (diffWeeks >= 2) return `Expires in ${diffWeeks} weeks`;
  if (diffWeeks === 1) return "Expires in 1 week";

  if (diffDays >= 2) return `Expires in ${diffDays} days`;
  if (diffDays === 1) return "Expires in 1 day";

  if (diffHours >= 2) return `Expires in ${diffHours} hours`;
  if (diffHours === 1) return "Expires in 1 hour";

  if (diffMinutes >= 2) return `Expires in ${diffMinutes} minutes`;
  return "Expires in 1 minute";
};

const getExpiryLabel = (poll: Poll): string | null => {
  if (!poll.expiresAt) {
    return poll.status === "active" ? "No expiry" : null;
  }
  const d = new Date(poll.expiresAt);
  if (Number.isNaN(d.getTime())) return null;

  const dateText = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const now = new Date();
  const isFuture = d.getTime() > now.getTime();

  if (poll.status === "closed") {
    return `Ended ${dateText}`;
  }

  if (poll.status === "expired" || !isFuture) {
    return `Expired ${dateText}`;
  }

  return formatExpiresIn(d);
};

export function PollCard({ poll }: { poll: Poll }) {
  const expiryLabel = getExpiryLabel(poll);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col gap-1 text-base font-medium">
            {poll.question}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>by {poll.author.username}</span>
              <span>
                {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
              </span>
              {expiryLabel && <span>{expiryLabel}</span>}
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide">
                {poll.status}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 pb-4">
          {poll.options.length > 0 && (
            <div className="space-y-2">
              {poll.options.slice(0, 4).map((opt, idx) => (
                <PollOptionBar
                  key={String(opt.index ?? idx)}
                  option={opt}
                  totalVotes={poll.totalVotes}
                  canViewResults={poll.canViewResults}
                />
              ))}
            </div>
          )}
          {!poll.canViewResults && (
            <p className="text-xs text-muted-foreground">
              Results are hidden until you vote or the poll expires.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
