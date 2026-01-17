import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment } from "@/types/comment";
import { CommentService } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

import { CommentBody } from "./comment-item/CommentBody";
import { CommentEngagementBar } from "./comment-item/CommentEngagementBar";
import { CommentHeader } from "./comment-item/CommentHeader";
import { useCommentEdit } from "./comment-item/useCommentEdit";
import { useCommentReactions } from "./comment-item/useCommentReactions";

interface CommentItemProps {
  comment: Comment;
  onDeleted?: (id: string) => void;
}

export function CommentItem({ comment, onDeleted }: CommentItemProps) {
  const { user } = useAuthStore();

  const { userReaction, reactionPending, reactionCount, selectReaction } =
    useCommentReactions({
      commentId: comment._id,
      initialCount: comment.reactionsCount || 0,
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

  const isAuthor = user?.clerkId && user.clerkId === comment.author.clerkId;

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
    <div className="group space-y-3">
      <div className="flex gap-4">
        <div className="shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.profileImage} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {comment.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <CommentHeader
            comment={comment}
            isAuthor={Boolean(isAuthor)}
            onEdit={startEdit}
            onDelete={() => void handleDelete()}
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
            userReaction={userReaction}
            reactionCount={reactionCount}
            reactionPending={reactionPending}
            onSelectReaction={(type) => void selectReaction(type)}
          />
        </div>
      </div>
    </div>
  );
}
