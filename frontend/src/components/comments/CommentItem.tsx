import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment } from "@/types/comment";
import { CommentService } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

import { CommentBody } from "./comment-item/CommentBody";
import { CommentEngagementBar } from "./comment-item/CommentEngagementBar";
import { CommentHeader } from "./comment-item/CommentHeader";
import { useCommentEdit } from "./comment-item/useCommentEdit";
import { useCommentLike } from "./comment-item/useCommentLike";

interface CommentItemProps {
  comment: Comment;
  contentAuthorClerkId?: string;
  onDeleted?: (id: string) => void;
}

export function CommentItem({
  comment,
  contentAuthorClerkId,
  onDeleted,
}: CommentItemProps) {
  const { user } = useAuthStore();

  const { likesCount, liked, likePending, toggleLike } = useCommentLike({
    commentId: comment._id,
    initialCount: comment.likesCount || 0,
  });

  const {
    bodyText,
    isEditing,
    editText,
    setEditText,
    editPending,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useCommentEdit({ commentId: comment._id, initialText: comment.text });

  const isOwner = user?.clerkId && user.clerkId === comment.author.clerkId;
  const isContentAuthor =
    contentAuthorClerkId && comment.author.clerkId === contentAuthorClerkId;

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await CommentService.delete(comment._id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete comment");
      }
      onDeleted?.(comment._id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete comment";
      toast.error(msg);
    }
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={comment.author.profileImage} />
          <AvatarFallback className="bg-white/5 text-white/80 font-medium">
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <CommentHeader
            comment={comment}
            isAuthor={Boolean(isContentAuthor)}
            onEdit={isOwner ? startEdit : undefined}
            onDelete={isOwner ? () => void handleDelete() : undefined}
          />

          <CommentBody
            isEditing={isEditing}
            bodyText={bodyText}
            editText={editText}
            onEditTextChange={setEditText}
            editPending={editPending}
            onCancel={cancelEdit}
            onSave={() => void saveEdit()}
          />

          <CommentEngagementBar
            liked={liked}
            likesCount={likesCount}
            likePending={likePending}
            onToggleLike={() => void toggleLike()}
          />
        </div>
      </div>
    </div>
  );
}
