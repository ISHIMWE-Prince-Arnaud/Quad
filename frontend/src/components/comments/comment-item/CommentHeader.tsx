import { timeAgo } from "@/lib/timeUtils";
import { PiDotsThreeBold, PiPencilBold, PiTrashBold } from "react-icons/pi";

import type { Comment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommentHeader({
  comment,
  isAuthor,
  onEdit,
  onRequestDelete,
}: {
  comment: Comment;
  isAuthor: boolean;
  onEdit?: () => void;
  onRequestDelete?: () => void;
}) {
  const showMenu = Boolean(onEdit && onRequestDelete);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex items-center gap-2">
        <span className="truncate text-[13px] font-bold text-foreground">
          {comment.author.username}
        </span>
        {isAuthor && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
            Author
          </span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">
          {timeAgo(comment.createdAt)}
        </span>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="Comment options">
                <PiDotsThreeBold className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent">
                <PiPencilBold
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Edit comment
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={onRequestDelete}
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                <PiTrashBold className="h-4 w-4" aria-hidden="true" />
                Delete comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
