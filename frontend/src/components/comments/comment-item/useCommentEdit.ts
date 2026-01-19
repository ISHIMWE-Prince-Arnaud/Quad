import { useEffect, useRef, useState } from "react";
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

  const lastInitialTextRef = useRef(initialText);

  useEffect(() => {
    // Keep local display state in sync with upstream comment updates (e.g. Socket.IO).
    // Don't clobber the user's in-progress edit.
    if (isEditing || editPending) return;
    if (lastInitialTextRef.current === initialText) return;
    lastInitialTextRef.current = initialText;
    setBodyText(initialText);
    setEditText(initialText);
  }, [initialText, isEditing, editPending]);

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

    const previousText = bodyText;

    // Optimistic update: reflect immediately in UI.
    setBodyText(value);
    setIsEditing(false);
    setEditPending(true);
    try {
      const res = await CommentService.update(commentId, value);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update comment");
      }
      setBodyText(res.data.text);
      setEditText(res.data.text);
      lastInitialTextRef.current = res.data.text;
    } catch (e) {
      // Rollback optimistic update and restore edit UI.
      setBodyText(previousText);
      setEditText(value);
      setIsEditing(true);
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
