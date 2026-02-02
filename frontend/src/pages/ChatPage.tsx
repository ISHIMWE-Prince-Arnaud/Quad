import { useCallback, useEffect, useRef } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/stores/authStore";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatMessageList } from "./chat/ChatMessageList";
import { ChatTypingIndicator } from "./chat/ChatTypingIndicator";
import { useNearBottom } from "./chat/useNearBottom";
import { useChatComposer } from "./chat/useChatComposer";
import { useChatHistory } from "./chat/useChatHistory";
import { useChatMessageActions } from "./chat/useChatMessageActions";
import { useChatReadMarker } from "./chat/useChatReadMarker";
import { useChatSocket } from "./chat/useChatSocket";

export default function ChatPage() {
  const { user } = useAuthStore();

  const listRef = useRef<HTMLDivElement | null>(null);

  const pendingScrollBottomRef = useRef(false);
  const pendingRestoreAfterPrependRef = useRef(false);
  const pendingPrependScrollRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const nearBottom = useNearBottom(listRef, 120);

  const handleInitialLoaded = useCallback(() => {
    pendingScrollBottomRef.current = true;
  }, []);

  const handlePrepended = useCallback(() => {
    pendingRestoreAfterPrependRef.current = true;
  }, []);

  const {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreOlder,
    newestMessageId,
    loadOlder,
  } = useChatHistory({
    onInitialLoaded: handleInitialLoaded,
    onPrepended: handlePrepended,
  });

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!pendingScrollBottomRef.current) return;
    pendingScrollBottomRef.current = false;
    requestAnimationFrame(() => scrollToBottom());
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!pendingRestoreAfterPrependRef.current) return;
    const el = listRef.current;
    const prev = pendingPrependScrollRef.current;
    pendingRestoreAfterPrependRef.current = false;

    if (!el || !prev) {
      pendingPrependScrollRef.current = null;
      return;
    }

    requestAnimationFrame(() => {
      const newScrollHeight = el.scrollHeight;
      const diff = newScrollHeight - prev.prevScrollHeight;
      el.scrollTop = prev.prevScrollTop + diff;
      pendingPrependScrollRef.current = null;
    });
  }, [messages.length]);

  const handleLoadOlder = useCallback(() => {
    const el = listRef.current;
    if (el) {
      pendingPrependScrollRef.current = {
        prevScrollHeight: el.scrollHeight,
        prevScrollTop: el.scrollTop,
      };
    }
    void loadOlder();
  }, [loadOlder]);

  const { typingUsers, emitTypingStart, emitTypingStop } = useChatSocket({
    user,
    nearBottom,
    scrollToBottom,
    setMessages,
  });

  useChatReadMarker({ newestMessageId, nearBottom });

  const {
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
  } = useChatMessageActions({ setMessages });

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText("");
  }, [setEditText, setEditingId]);

  const handleSaveEditClick = useCallback(
    (id: string) => {
      void handleSaveEdit(id);
    },
    [handleSaveEdit],
  );

  const { text, sending, handleTextChange, handleSend } = useChatComposer({
    emitTypingStart,
    emitTypingStop,
    onMessageSent: (m) => {
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, m];
      });
      requestAnimationFrame(() => scrollToBottom());
    },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatMessageList
        listRef={listRef}
        loading={loading}
        loadingOlder={loadingOlder}
        hasMoreOlder={hasMoreOlder}
        onLoadOlder={handleLoadOlder}
        messages={messages}
        user={user}
        editingId={editingId}
        editText={editText}
        onEditTextChange={setEditText}
        onStartEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEditClick}
        onDeleteMessage={handleDeleteClick}
      />

      {Object.keys(typingUsers).length > 0 && (
        <ChatTypingIndicator typingUsers={typingUsers} />
      )}

      <ChatComposer
        text={text}
        sending={sending}
        onTextChange={handleTextChange}
        onSend={() => void handleSend()}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
