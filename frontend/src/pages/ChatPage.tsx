import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/stores/authStore";
import { ChatComposer } from "./chat/ChatComposer";
import { ChatHeader } from "./chat/ChatHeader";
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

  const [unseenCount, setUnseenCount] = useState(0);
  const nearBottomRef = useRef(true);

  const pendingScrollBottomRef = useRef(false);
  const pendingRestoreAfterPrependRef = useRef(false);
  const pendingPrependScrollRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const handleNearBottomChange = useCallback((isNear: boolean) => {
    nearBottomRef.current = isNear;
    if (isNear) setUnseenCount(0);
  }, []);

  const nearBottom = useNearBottom(listRef, 120, handleNearBottomChange);

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

  const handleIncomingMessage = useCallback(() => {
    if (!nearBottomRef.current) setUnseenCount((c) => c + 1);
  }, []);

  const handleJumpToBottom = useCallback(() => {
    scrollToBottom();
    setUnseenCount(0);
  }, [scrollToBottom]);

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
    onIncomingMessage: handleIncomingMessage,
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
    [handleSaveEdit]
  );

  const {
    text,
    sending,
    handleTextChange,
    handleSend,
  } = useChatComposer({
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
    <div className="flex flex-col h-[calc(100vh-47px)] max-w-4xl mx-auto overflow-hidden bg-card rounded-3xl border border-border shadow-2xl">
      <ChatHeader />

      <div className="flex-1 flex flex-col min-h-0 relative">
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

        {!nearBottom && (
          <button
            type="button"
            onClick={handleJumpToBottom}
            className="absolute bottom-4 right-6 z-20 flex items-center gap-2 rounded-full bg-background/90 backdrop-blur border border-border shadow-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-background transition-colors"
            aria-label="Scroll to bottom">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
            <span className="tabular-nums">
              {unseenCount > 0
                ? `${unseenCount > 99 ? "99+" : unseenCount} new`
                : "Scroll to bottom"}
            </span>
          </button>
        )}
      </div>

      <div className="px-6 pb-2">
        <ChatTypingIndicator typingUsers={typingUsers} />
      </div>

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
