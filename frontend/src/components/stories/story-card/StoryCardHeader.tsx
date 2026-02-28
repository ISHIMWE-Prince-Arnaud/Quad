import { Link } from "react-router-dom";
import {
  PiDotsThreeBold,
  PiPencilBold,
  PiTrashBold,
  PiLinkBold,
  PiEyeBold,
} from "react-icons/pi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/timeUtils";

export function StoryCardHeader({
  storyId,
  createdAt,
  isOwner,
  onCopyLink,
  onEdit,
  onDelete,
}: {
  storyId: string;
  createdAt: string;
  isOwner: boolean;
  onCopyLink: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between group">
      <span className="text-xs font-medium text-muted-foreground mt-1">
        {timeAgo(createdAt)}
      </span>

      {/* More options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
            aria-label="Story options">
            <PiDotsThreeBold className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[180px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          <DropdownMenuItem
            asChild
            className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent">
            <Link to={`/app/stories/${storyId}`}>
              <PiEyeBold
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              View story
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCopyLink}
            className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent">
            <PiLinkBold
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            Copy link
          </DropdownMenuItem>

          {isOwner && (
            <>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent">
                <PiPencilBold
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Edit story
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                onClick={onDelete}>
                <PiTrashBold className="h-4 w-4" aria-hidden="true" />
                Delete story
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
