import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

import { ChatService } from "@/services/chatService";
import type { ChatMessage } from "@/types/chat";
import { logError } from "@/lib/errorHandling";

export function useChatMessageActions({
  messages,
  setMessages,
}: {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId);
      if (idx === -1) return prev;
      const m = prev[idx];
      const prevUserEmoji = m.userReaction || null;
      let reactionsCount = m.reactionsCount || 0;
      let reactions = m.reactions;
      let nextUserEmoji: string | null = prevUserEmoji;

      const dec = (arr: typeof reactions, targetEmoji: string) => {
        if (!arr) return arr;
        const next = arr
          .map((r) =>
            r.emoji === targetEmoji ? { ...r, count: Math.max(0, r.count - 1) } : r
          )
          .filter((r) => r.count > 0);
        return next;
      };

      const inc = (arr: typeof reactions, targetEmoji: string) => {
        if (!arr) return arr;
        const existing = arr.find((r) => r.emoji === targetEmoji);
        if (existing) {
          return arr.map((r) =>
            r.emoji === targetEmoji ? { ...r, count: r.count + 1 } : r
          );
        }
        return [...arr, { emoji: targetEmoji, count: 1 }];
      };

      if (prevUserEmoji === emoji) {
        reactionsCount = Math.max(0, reactionsCount - 1);
        reactions = dec(reactions, emoji);
        nextUserEmoji = null;
      } else {
        if (!prevUserEmoji) reactionsCount = reactionsCount + 1;
        if (prevUserEmoji) reactions = dec(reactions, prevUserEmoji);
        reactions = inc(reactions, emoji);
        nextUserEmoji = emoji;
      }
      const copy = [...prev];
      copy[idx] = {
        ...m,
        reactionsCount,
        userReaction: nextUserEmoji,
        ...(reactions ? { reactions } : {}),
      };
      return copy;
    });

    try {
      const target = messages.find((m) => m.id === messageId);
      const prevUserEmoji = target?.userReaction || null;
      if (prevUserEmoji === emoji) {
        const res = await ChatService.removeReaction(messageId);
        if (!res.success)
          throw new Error(res.message || "Failed to remove reaction");

        if (res.data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    reactionsCount: res.data!.reactionsCount,
                    ...(res.data!.reactions ? { reactions: res.data!.reactions } : {}),
                    userReaction: null,
                  }
                : m
            )
          );
        }
      } else {
        const res = await ChatService.addReaction(messageId, emoji);
        if (!res.success) throw new Error(res.message || "Failed to react");

        if (res.data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    reactionsCount: res.data!.reactionsCount,
                    ...(res.data!.reactions ? { reactions: res.data!.reactions } : {}),
                    userReaction: emoji,
                  }
                : m
            )
          );
        }
      }
    } catch (err) {
      logError(err, {
        component: "ChatMessageActions",
        action: "toggleReaction",
        metadata: { messageId, emoji },
      });
      toast.error("Failed to update reaction");
    }
  }, [messages, setMessages]);

  const handleEdit = useCallback((m: ChatMessage) => {
    setEditingId(m.id);
    setEditText(m.text || "");
  }, []);

  const handleSaveEdit = useCallback(async (id: string) => {
    try {
      const res = await ChatService.editMessage(id, { text: editText });
      if (res.success && res.data) {
        setMessages((prev) => prev.map((m) => (m.id === id ? res.data! : m)));
        setEditingId(null);
        setEditText("");
      } else {
        toast.error(res.message || "Failed to edit message");
      }
    } catch (err) {
      logError(err, {
        component: "ChatMessageActions",
        action: "saveEdit",
        metadata: { id },
      });
      toast.error("Failed to edit message");
    }
  }, [editText, setMessages]);

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
        toast.success("Message deleted");
      } else {
        toast.error(res.message || "Failed to delete message");
      }
    } catch (err) {
      logError(err, {
        component: "ChatMessageActions",
        action: "deleteMessage",
        metadata: { messageId: messageToDelete },
      });
      const serverMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      toast.error(serverMessage || "Failed to delete message");
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
    toggleReaction,

    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
