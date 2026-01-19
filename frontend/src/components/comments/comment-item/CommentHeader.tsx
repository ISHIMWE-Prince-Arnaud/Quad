import { timeAgo } from "@/lib/timeUtils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Comment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        <span className="truncate text-[13px] font-semibold text-[#e2e8f0]">
          {comment.author.username}
        </span>
        {isAuthor && (
          <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
            Author
          </span>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-medium text-[#64748b]">
          {timeAgo(comment.createdAt)}
        </span>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-[#94a3b8] hover:text-white hover:bg-white/5"
                aria-label="Comment options">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] rounded-xl border border-white/10 bg-[#0b1220] p-1 shadow-xl">
              <DropdownMenuItem
                onClick={onEdit}
                className="rounded-lg px-3 py-2 text-[13px] text-[#e2e8f0] focus:bg-white/5 focus:text-white">
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit comment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onRequestDelete}
                className="rounded-lg px-3 py-2 text-[13px] text-[#ef4444] focus:bg-white/5 focus:text-[#ef4444]">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
