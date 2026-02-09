import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { ChatService } from "@/services/chatService";
import type { ChatMessage } from "@/types/chat";
import { logError } from "@/lib/errorHandling";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";

export function useChatMessageActions({
  setMessages,
}: {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = useCallback((m: ChatMessage) => {
    setEditingId(m.id);
    setEditText(m.text || "");
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string) => {
      try {
        const res = await ChatService.editMessage(id, { text: editText });
        if (res.success && res.data) {
          setMessages((prev) => prev.map((m) => (m.id === id ? res.data! : m)));
          setEditingId(null);
          setEditText("");
        } else {
          showErrorToast(res.message || "Failed to edit");
        }
      } catch (err) {
        logError(err, {
          component: "ChatMessageActions",
          action: "saveEdit",
          metadata: { id },
        });
        showErrorToast("Failed to edit message");
      }
    },
    [editText, setMessages],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setMessageToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!messageToDelete) return;
    try {
      setDeleting(true);
      const res = await ChatService.deleteMessage(messageToDelete);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
        setDeleteConfirmOpen(false);
        setMessageToDelete(null);
        showSuccessToast("Message deleted");
      } else {
        showErrorToast(res.message || "Failed to delete");
      }
    } catch (err) {
      logError(err, {
        component: "ChatMessageActions",
        action: "deleteMessage",
        metadata: { messageId: messageToDelete },
      });
      const serverMessage = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      showErrorToast(serverMessage || "Failed to delete message");
    } finally {
      setDeleting(false);
    }
  }, [messageToDelete, setMessages]);

  return {
    editingId,
    setEditingId,
    editText,
    setEditText,
    handleEdit,
    handleSaveEdit,

    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
