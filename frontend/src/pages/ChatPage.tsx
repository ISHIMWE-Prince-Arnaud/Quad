import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent } from "@/components/ui/card";
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

  const [pendingScrollBottom, setPendingScrollBottom] = useState(false);
  const [pendingScrollIndex, setPendingScrollIndex] = useState<number | null>(
    null
  );

  const nearBottom = useNearBottom(listRef);

  const {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMoreOlder,
    newestMessageId,
    loadOlder,
  } = useChatHistory({
    onInitialLoaded: () => setPendingScrollBottom(true),
    onPrepended: (prependedCount) => setPendingScrollIndex(prependedCount),
  });

  // Virtualized scrolling setup
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 100, // Estimated message height
    overscan: 5, // Render 5 extra items above and below viewport
  });

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    // Scroll to the last message
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, virtualizer]);

  useEffect(() => {
    if (!pendingScrollBottom) return;
    requestAnimationFrame(() => scrollToBottom());
    setPendingScrollBottom(false);
  }, [pendingScrollBottom, scrollToBottom]);

  useEffect(() => {
    if (pendingScrollIndex === null) return;
    requestAnimationFrame(() => {
      virtualizer.scrollToIndex(pendingScrollIndex, { align: "start" });
    });
    setPendingScrollIndex(null);
  }, [pendingScrollIndex, virtualizer]);

  const { connection, typingUsers, emitTypingStart, emitTypingStop } = useChatSocket({
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
    toggleReaction,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleting,
    handleDeleteClick,
    handleDeleteConfirm,
  } = useChatMessageActions({ messages, setMessages });

  const {
    text,
    media,
    uploading,
    sending,
    setMedia,
    handleTextChange,
    insertEmoji,
    handleFileSelected,
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
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <ChatHeader connection={connection} />

        <Card>
          <CardContent className="p-0">
            <ChatMessageList
              listRef={listRef}
              loading={loading}
              loadingOlder={loadingOlder}
              hasMoreOlder={hasMoreOlder}
              onLoadOlder={() => void loadOlder()}
              messages={messages}
              user={user}
              virtualizer={virtualizer}
              editingId={editingId}
              editText={editText}
              onEditTextChange={setEditText}
              onStartEdit={handleEdit}
              onCancelEdit={() => {
                setEditingId(null);
                setEditText("");
              }}
              onSaveEdit={(id) => void handleSaveEdit(id)}
              onToggleReaction={(messageId, emoji) =>
                void toggleReaction(messageId, emoji)
              }
              onDeleteMessage={handleDeleteClick}
            />

            <ChatTypingIndicator typingUsers={typingUsers} />

            <ChatComposer
              text={text}
              media={media}
              uploading={uploading}
              sending={sending}
              onTextChange={handleTextChange}
              onRemoveMedia={() => setMedia(null)}
              onFileSelected={(file) => void handleFileSelected(file)}
              onInsertEmoji={insertEmoji}
              onSend={() => void handleSend()}
            />
          </CardContent>
        </Card>

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
    </div>
  );
}
