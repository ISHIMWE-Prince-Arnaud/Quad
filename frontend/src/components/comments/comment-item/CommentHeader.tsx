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
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-semibold text-foreground">
        @{comment.author.username}
      </span>
      {isAuthor && (
        <span className="rounded-[4px] bg-blue-600/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-500 uppercase tracking-wide">
          Author
        </span>
      )}
      <span className="text-muted-foreground text-xs">
        {timeAgo(comment.createdAt)}
      </span>

      {/* Edit/Delete controls could be a dropdown menu or minimal text buttons. Keeping simple for now but ensuring they don't break flow */}
      {(onEdit || onDelete) && isAuthor && (
        <div className="ml-2 flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="hover:text-foreground">
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="hover:text-destructive">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
