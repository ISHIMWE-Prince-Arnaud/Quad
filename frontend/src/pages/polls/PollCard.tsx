import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Poll } from "@/types/poll";

import { PollOptionBar } from "./PollOptionBar";

export function PollCard({ poll }: { poll: Poll }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-col gap-1 text-base font-medium">
            <Link to={`/app/polls/${poll.id}`} className="hover:underline">
              {poll.question}
            </Link>
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
