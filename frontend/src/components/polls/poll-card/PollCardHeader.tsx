import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  );
}
