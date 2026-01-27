import { motion } from "framer-motion";
import { EyeOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { HeartReactionButton } from "@/components/reactions/HeartReactionButton";
import { usePollReactions } from "@/components/polls/poll-card/usePollReactions";
import type { Poll } from "@/types/poll";
import { cn } from "@/lib/utils";

import { PollOptionBar } from "./PollOptionBar";

const displayNameFromAuthor = (poll: Poll): string => {
  const first = poll.author.firstName?.trim();
  const last = poll.author.lastName?.trim();
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name.length > 0 ? name : poll.author.username;
};

const timeAgoShort = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  if (Number.isNaN(past.getTime())) return "";
  if (diffMs < 60 * 1000) return "now";

  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function PollCard({ poll }: { poll: Poll }) {
  const displayName = displayNameFromAuthor(poll);
  const subtitle = poll.author.bio?.trim() || "";
  const hasAvatar = Boolean(poll.author.profileImage);
  const mediaUrl = poll.questionMedia?.url;
  const hasMedia = Boolean(mediaUrl);

  const actionBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748b] transition-all";

  const { userReaction, reactionPending, reactionCount, handleSelectReaction } =
    usePollReactions(poll.id, poll.reactionsCount || 0);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <Card className="bg-[#0f121a] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <CardContent className="p-6">
          <div
            className={cn(
              "flex flex-col",
              hasAvatar ? "items-start" : "items-center text-center"
            )}>
            {hasAvatar && (
              <div className="flex items-center gap-3">
                <img
                  src={poll.author.profileImage}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover border-2 border-white/10 shadow-inner"
                />
                <div>
                  <div className="text-[14px] font-bold text-white leading-tight">
                    {displayName}
                  </div>
                  {subtitle && (
                    <div className="text-[11px] font-medium text-[#94a3b8] truncate max-w-[320px]">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!hasAvatar && (
              <>
                <div className="text-[14px] font-bold text-white leading-tight">
                  {displayName}
                </div>
                {subtitle && (
                  <div className="text-[11px] font-medium text-[#94a3b8] mt-0.5">
                    {subtitle}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={cn("mt-4", hasAvatar ? "" : "mt-5")}>
            <h3 className="text-[15px] font-bold text-white leading-snug">
              {poll.question}
            </h3>
          </div>

          {hasMedia && (
            <div className="mt-4">
              <img
                src={mediaUrl!}
                alt=""
                className="w-full h-64 object-cover rounded-2xl border border-white/5"
              />
            </div>
          )}

          {poll.options.length > 0 && (
            <div className="mt-4 space-y-3">
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

          <div className={cn("flex items-center justify-between border-t border-white/5 pt-4", hasMedia ? "mt-4" : "mt-4")}>
            <div className="flex items-center gap-6 text-[#94a3b8]">
              <HeartReactionButton
                liked={Boolean(userReaction)}
                count={reactionCount}
                pending={reactionPending}
                onToggle={() => void handleSelectReaction("love")}
                ariaLabel={`React to poll. ${reactionCount} reactions`}
                className={cn(actionBase, "hover:bg-white/5")}
                countClassName="text-xs font-bold text-[#64748b]"
              />
            </div>

            <div className="flex items-center gap-4 text-[#94a3b8]">
              {poll.settings.anonymousVoting && (
                <div className="flex items-center gap-2 text-[12px] font-medium">
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  Anonymous
                </div>
              )}
              <span className="text-[12px] font-medium">
                {timeAgoShort(poll.createdAt)}
              </span>
            </div>
          </div>

          {!poll.canViewResults && (
            <p className="mt-3 text-[12px] font-medium text-[#94a3b8]">
              Vote to see results.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
