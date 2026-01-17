import { timeAgo } from "@/lib/timeUtils";

import type { Comment } from "@/types/comment";

export function CommentHeader({
  comment,
  isAuthor,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
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

        {onEdit && onDelete && (
          <div className="ml-1 hidden items-center gap-2 text-[11px] text-[#64748b] group-hover:flex">
            <button type="button" onClick={onEdit} className="hover:text-white">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="hover:text-destructive">
              Delete
            </button>
          </div>
        )}
      </div>

      <span className="shrink-0 text-[11px] font-medium text-[#64748b]">
        {timeAgo(comment.createdAt)}
      </span>
    </div>
  );
}
