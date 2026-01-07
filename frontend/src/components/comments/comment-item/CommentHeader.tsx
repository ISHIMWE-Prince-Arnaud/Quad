import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.profileImage} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {comment.author.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="font-semibold truncate max-w-[160px]">
            {comment.author.username}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>· {timeAgo(comment.createdAt)}</span>
            {isAuthor && (
              <>
                <button type="button" onClick={onEdit} className="hover:underline">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="hover:underline text-destructive">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
