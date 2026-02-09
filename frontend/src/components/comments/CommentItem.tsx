import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment } from "@/types/comment";
import { CommentService } from "@/services/commentService";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { CommentBody } from "./comment-item/CommentBody";
import { CommentEngagementBar } from "./comment-item/CommentEngagementBar";
import { CommentHeader } from "./comment-item/CommentHeader";
import { useCommentEdit } from "./comment-item/useCommentEdit";
import { useCommentLike } from "./comment-item/useCommentLike";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showErrorToast } from "@/lib/error-handling/toasts";

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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

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
    if (deletePending) return;
    setDeletePending(true);
    try {
      const res = await CommentService.delete(comment._id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete comment");
      }
      setDeleteOpen(false);
      onDeleted?.(comment._id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete comment";
      showErrorToast(msg);
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={comment.author.profileImage} />
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <CommentHeader
            comment={comment}
            isAuthor={Boolean(isContentAuthor)}
            onEdit={isOwner ? startEdit : undefined}
            onRequestDelete={isOwner ? () => setDeleteOpen(true) : undefined}
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

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (deletePending) return;
          setDeleteOpen(open);
        }}>
        <DialogContent
          showClose={false}
          className="max-w-md rounded-3xl border border-border bg-popover p-8 text-popover-foreground shadow-dropdown">
          <DialogHeader className="items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center">
              <div className="h-10 w-10 rounded-xl bg-destructive flex items-center justify-center">
                <Trash2
                  className="h-5 w-5 text-destructive-foreground"
                  aria-hidden="true"
                />
              </div>
            </div>
            <DialogTitle className="text-[28px] font-bold tracking-tight">
              Delete Comment?
            </DialogTitle>
            <DialogDescription className="text-center text-[14px] leading-relaxed text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot
              be undone and it will be removed from the conversation forever.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 flex flex-row items-center justify-center gap-4 sm:justify-center sm:space-x-0">
            <Button
              type="button"
              variant="secondary"
              className="h-12 rounded-full px-10 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              disabled={deletePending}
              onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-12 rounded-full px-10"
              loading={deletePending}
              disabled={deletePending}
              onClick={() => void handleDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
