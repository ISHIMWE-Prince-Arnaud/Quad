import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/timeUtils";

export function StoryCardHeader({
  storyId,
  createdAt,
  isOwner,
  authorUsername,
  onCopyLink,
  onEdit,
  onDelete,
}: {
  storyId: string;
  createdAt: string;
  isOwner: boolean;
  authorUsername: string;
  onCopyLink: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-xs text-muted-foreground">{timeAgo(createdAt)}</span>

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/app/stories/${storyId}`}>View story</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyLink}>Copy link</DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit story</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete story
              </DropdownMenuItem>
            </>
          )}
          {!isOwner && (
            <>
              <DropdownMenuItem>Report story</DropdownMenuItem>
              <DropdownMenuItem>Block {authorUsername}</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
