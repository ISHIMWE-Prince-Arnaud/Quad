import { useState } from "react";
import toast from "react-hot-toast";

import { CommentService } from "@/services/commentService";

export function useCommentEdit({
  commentId,
  initialText,
}: {
  commentId: string;
  initialText: string;
}) {
  const [bodyText, setBodyText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(initialText);
  const [editPending, setEditPending] = useState(false);

  const startEdit = () => {
    setEditText(bodyText);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText(bodyText);
  };

  const saveEdit = async () => {
    const value = editText.trim();
    if (!value || editPending) return;
    setEditPending(true);
    try {
      const res = await CommentService.update(commentId, value);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update comment");
      }
      setBodyText(res.data.text);
      setIsEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update comment";
      toast.error(msg);
    } finally {
      setEditPending(false);
    }
  };

  return {
    bodyText,
    isEditing,
    editText,
    setEditText,
    editPending,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
