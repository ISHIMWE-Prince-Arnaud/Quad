import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/timeUtils";
import type { Poll } from "@/types/poll";

export function PollCardHeader({
  poll,
  displayName,
  isOwner,
  canDelete,
  onRequestDelete,
}: {
  poll: Poll;
  displayName: string;
  isOwner: boolean;
  canDelete: boolean;
  onRequestDelete: () => void;
}) {
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

  const now = new Date();
  const expiresAtDate = poll.expiresAt ? new Date(poll.expiresAt) : null;
  const hasValidExpiresAt = Boolean(
    expiresAtDate && !Number.isNaN(expiresAtDate.getTime()),
  );
  const isExpiredByTime = Boolean(
    hasValidExpiresAt &&
    expiresAtDate &&
    expiresAtDate.getTime() <= now.getTime(),
  );
  const isActive = poll.status === "active" && !isExpiredByTime;

  const statusText = (() => {
    if (isActive) {
      if (hasValidExpiresAt && expiresAtDate)
        return formatExpiresIn(expiresAtDate);
      return "Active";
    }

    const fallbackDate = new Date(poll.updatedAt || poll.createdAt);
    const d = hasValidExpiresAt && expiresAtDate ? expiresAtDate : fallbackDate;
    const dateText = d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    return `Expired/Closed ${dateText}`;
  })();

  return (
    <div className="flex items-start justify-between">
      {/* Author info */}
      <Link
        to={`/app/profile/${poll.author.username}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Avatar className="h-10 w-10">
          <AvatarImage src={poll.author.profileImage} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {displayName.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm truncate max-w-[180px]">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            @{poll.author.username}
            <span className="mx-1">·</span>
            {timeAgo(poll.createdAt)}
          </p>
        </div>
      </Link>

      {/* More options */}
      <div className="flex items-center gap-2">
        <Badge
          className={
            isActive
              ? "gap-1.5 border-emerald-500/25 bg-emerald-500/15 text-emerald-200 shadow-sm backdrop-blur-sm"
              : "gap-1.5 border-red-500/25 bg-red-500/15 text-red-200 shadow-sm backdrop-blur-sm"
          }>
          <span
            className={
              isActive
                ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
                : "h-1.5 w-1.5 rounded-full bg-red-300"
            }
          />
          <span className="whitespace-nowrap">{statusText}</span>
        </Badge>

        {isOwner && canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={onRequestDelete}>
                Delete poll
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
