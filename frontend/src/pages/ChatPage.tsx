import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { UploadService } from "@/services/uploadService";
import { ChatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import type { ChatMedia, ChatMessage } from "@/types/chat";
import { getSocket } from "@/lib/socket";
import type {
  ChatMessagePayload,
  ChatReactionAddedPayload,
  ChatReactionRemovedPayload,
  ChatTypingStartPayload,
  ChatTypingStopPayload,
} from "@/lib/socket";
import toast from "react-hot-toast";
import {
  Send,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  X,
} from "lucide-react";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"] as const;
const MAX_MESSAGE_LENGTH = 2000;

function useNearBottom(
  ref: Readonly<{ current: HTMLElement | null }>,
  threshold = 120
) {
  const [nearBottom, setNearBottom] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setNearBottom(distance < threshold);
    };
    el.addEventListener("scroll", handler);
    handler();
    return () => el.removeEventListener("scroll", handler);
  }, [ref, threshold]);
  return nearBottom;
}

export default function ChatPage() {
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const [text, setText] = useState("");
  const [media, setMedia] = useState<ChatMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [lastReadId, setLastReadId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  const nearBottom = useNearBottom(listRef);

  // Virtualized scrolling setup
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 100, // Estimated message height
    overscan: 5, // Render 5 extra items above and below viewport
  });

  const oldestMessageId = useMemo(
    () => (messages.length > 0 ? messages[0].id : null),
    [messages]
  );
  const newestMessageId = useMemo(
    () => (messages.length > 0 ? messages[messages.length - 1].id : null),
    [messages]
  );

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    // Scroll to the last message
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, virtualizer]);

  const loadOlder = useCallback(async () => {
    if (!oldestMessageId || loadingOlder) return;
    try {
      setLoadingOlder(true);

      const res = await ChatService.getMessages({
        before: oldestMessageId,
        limit: 30,
        page: 1,
      });
      if (res.success && res.data.length > 0) {
        setMessages((prev) => [...res.data, ...prev]);
        setHasMoreOlder(res.pagination?.hasMore ?? false);

        // Preserve scroll position after prepending by scrolling to the same message index
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(res.data.length, { align: "start" });
        });
      } else {
        setHasMoreOlder(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }, [oldestMessageId, loadingOlder, messages.length, virtualizer]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await ChatService.getMessages({ page: 1, limit: 30 });
        if (!cancelled && res.success) {
          setMessages(res.data);
          setHasMoreOlder(res.pagination?.hasMore ?? false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat");
      } finally {
        if (!cancelled) setLoading(false);
        // Scroll after first paint
        requestAnimationFrame(() => scrollToBottom());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scrollToBottom]);

  // Load older messages when scrolling near the top
  useEffect(() => {
    const container = listRef.current;
    if (!container || !hasMoreOlder || loadingOlder) return;

    const handleScroll = () => {
      // Load more when scrolled within 200px of the top
      if (container.scrollTop < 200) {
        void loadOlder();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreOlder, loadingOlder, loadOlder]);

  // Socket wiring
  useEffect(() => {
    const socket = getSocket();

    setConnection(socket.connected ? "connected" : "connecting");

    const onConnect = () => setConnection("connected");
    const onDisconnect = () => setConnection("disconnected");
    const onConnectError = () => setConnection("disconnected");
    const onReconnectAttempt = () => setConnection("connecting");

    const onNew = (payload: ChatMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        const next = [...prev, payload as unknown as ChatMessage];
        return next;
      });
      // Auto scroll if near bottom
      if (nearBottom) requestAnimationFrame(() => scrollToBottom());
    };

    const onEdited = (payload: ChatMessagePayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === payload.id ? (payload as unknown as ChatMessage) : m
        )
      );
    };

    const onDeleted = (id: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onReactionAdded = (p: ChatReactionAddedPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === p.messageId ? { ...m, reactionsCount: p.reactionsCount } : m
        )
      );
    };

    const onReactionRemoved = (p: ChatReactionRemovedPayload) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === p.messageId ? { ...m, reactionsCount: p.reactionsCount } : m
        )
      );
    };

    const onTypingStart = (p: ChatTypingStartPayload) => {
      // Ignore own typing events (they are broadcast to others)
      if (p.userId === user?.clerkId) return;
      setTypingUsers((prev) => ({ ...prev, [p.userId]: p.username }));
      // Auto-stop typing after 3s if no stop event
      setTimeout(() => {
        setTypingUsers((curr) => {
          const copy = { ...curr };
          delete copy[p.userId];
          return copy;
        });
      }, 3000);
    };

    const onTypingStop = (p: ChatTypingStopPayload) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[p.userId];
        return copy;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);

    socket.on("chat:message:new", onNew);
    socket.on("chat:message:edited", onEdited);
    socket.on("chat:message:deleted", onDeleted);
    socket.on("chat:reaction:added", onReactionAdded);
    socket.on("chat:reaction:removed", onReactionRemoved);
    socket.on("chat:typing:start", onTypingStart);
    socket.on("chat:typing:stop", onTypingStop);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);

      socket.off("chat:message:new", onNew);
      socket.off("chat:message:edited", onEdited);
      socket.off("chat:message:deleted", onDeleted);
      socket.off("chat:reaction:added", onReactionAdded);
      socket.off("chat:reaction:removed", onReactionRemoved);
      socket.off("chat:typing:start", onTypingStart);
      socket.off("chat:typing:stop", onTypingStop);
    };
  }, [user?.clerkId, nearBottom, scrollToBottom]);

  // Mark as read when at bottom or when new messages arrive
  useEffect(() => {
    if (!newestMessageId) return;
    if (!nearBottom) return;
    if (lastReadId === newestMessageId) return;
    (async () => {
      try {
        const res = await ChatService.markAsRead(newestMessageId);
        if (res.success) setLastReadId(newestMessageId);
      } catch {
        // ignore read-marker errors for now
      }
    })();
  }, [newestMessageId, nearBottom, lastReadId]);

  // Typing emitters
  const emitTypingStart = useCallback(() => {
    const socket = getSocket();
    if (!user) return;
    socket.emit("chat:typing:start", {
      userId: user.clerkId,
      username: user.username,
    });
  }, [user]);

  const emitTypingStop = useCallback(() => {
    const socket = getSocket();
    if (!user) return;
    socket.emit("chat:typing:stop", { userId: user.clerkId });
  }, [user]);

  const handleTextChange = (v: string) => {
    setText(v);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    emitTypingStart();
    typingTimerRef.current = window.setTimeout(() => {
      emitTypingStop();
      typingTimerRef.current = null;
    }, 1500);
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await UploadService.uploadChatMedia(file);
      const chatMedia: ChatMedia = {
        url,
        type: file.type.startsWith("video/") ? "video" : "image",
      };
      setMedia(chatMedia);
      toast.success("Media attached");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    const contentOk = (text && text.trim().length > 0) || media;
    if (!contentOk || sending) return;
    try {
      setSending(true);
      const res = await ChatService.sendMessage({
        text: text.trim() || undefined,
        media: media || undefined,
      });
      if (res.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data!.id)) return prev;
          return [...prev, res.data!];
        });
        setText("");
        setMedia(null);
        emitTypingStop();
        requestAnimationFrame(() => scrollToBottom());
      } else {
        toast.error(res.message || "Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId);
      if (idx === -1) return prev;
      const m = prev[idx];
      const prevUserEmoji = m.userReaction || null;
      let reactionsCount = m.reactionsCount || 0;
      let nextUserEmoji: string | null = prevUserEmoji;
      if (prevUserEmoji === emoji) {
        reactionsCount = Math.max(0, reactionsCount - 1);
        nextUserEmoji = null;
      } else {
        if (!prevUserEmoji) reactionsCount = reactionsCount + 1;
        nextUserEmoji = emoji;
      }
      const copy = [...prev];
      copy[idx] = { ...m, reactionsCount, userReaction: nextUserEmoji };
      return copy;
    });

    try {
      const target = messages.find((m) => m.id === messageId);
      const prevUserEmoji = target?.userReaction || null;
      if (prevUserEmoji === emoji) {
        const res = await ChatService.removeReaction(messageId);
        if (!res.success)
          throw new Error(res.message || "Failed to remove reaction");
      } else {
        const res = await ChatService.addReaction(messageId, emoji);
        if (!res.success) throw new Error(res.message || "Failed to react");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reaction");
    }
  };

  const handleEdit = (m: ChatMessage) => {
    setEditingId(m.id);
    setEditText(m.text || "");
  };

  const handleSaveEdit = async (id: string) => {
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
      console.error(err);
      toast.error("Failed to edit message");
    }
  };

  const handleDeleteClick = (id: string) => {
    setMessageToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
      console.error(err);
      toast.error("Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  const connectionDot =
    connection === "connected"
      ? "bg-green-500"
      : connection === "connecting"
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Global Chat</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", connectionDot)} />
            <span className="capitalize">{connection}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {/* Messages list with virtualization */}
            <div
              ref={listRef}
              className="h-[calc(100vh-260px)] overflow-y-auto p-4">
              {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading
                  conversation...
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              )}

              {!loading && messages.length > 0 && (
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}>
                  {loadingOlder && (
                    <div className="text-center text-xs text-muted-foreground py-2">
                      Loading older messages...
                    </div>
                  )}
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const m = messages[virtualItem.index];
                    const isSelf = m.author.clerkId === user?.clerkId;
                    return (
                      <div
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className="pb-4">
                        <div
                          className={cn(
                            "flex items-end gap-2",
                            isSelf ? "justify-end" : "justify-start"
                          )}>
                          {!isSelf && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={m.author.profileImage}
                                alt={m.author.username}
                              />
                              <AvatarFallback>
                                {m.author.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-3 py-2",
                              isSelf
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}>
                            <div className="text-xs mb-1 opacity-80">
                              {!isSelf && m.author.username}
                            </div>

                            {editingId === m.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={2}
                                  className={cn(
                                    "text-sm",
                                    isSelf
                                      ? "text-primary-foreground"
                                      : undefined
                                  )}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditText("");
                                    }}>
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => void handleSaveEdit(m.id)}>
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {m.text && (
                                  <div className="whitespace-pre-wrap text-sm">
                                    {m.text}
                                  </div>
                                )}
                                {m.media && (
                                  <div className="mt-2 overflow-hidden rounded-lg">
                                    {m.media.type === "image" ? (
                                      <img
                                        src={m.media.url}
                                        alt="attachment"
                                        className="max-h-96 rounded-lg"
                                      />
                                    ) : (
                                      <video
                                        src={m.media.url}
                                        controls
                                        className="max-h-96 rounded-lg"
                                      />
                                    )}
                                  </div>
                                )}
                                <div className="mt-1 flex items-center justify-between gap-3 text-[11px] opacity-80">
                                  <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          className={cn(
                                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                                            isSelf
                                              ? "bg-primary-foreground/20"
                                              : "bg-background/60"
                                          )}>
                                          <span>{m.userReaction || "😍"}</span>
                                          <span>{m.reactionsCount || 0}</span>
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align={isSelf ? "end" : "start"}>
                                        {REACTION_EMOJIS.map((emoji) => (
                                          <DropdownMenuItem
                                            key={emoji}
                                            onClick={() =>
                                              void toggleReaction(m.id, emoji)
                                            }>
                                            {emoji}
                                          </DropdownMenuItem>
                                        ))}
                                        {m.userReaction && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              void toggleReaction(
                                                m.id,
                                                m.userReaction!
                                              )
                                            }>
                                            <span className="text-red-500">
                                              Remove my reaction
                                            </span>
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {m.timestamp}
                                      {m.isEdited ? " • edited" : ""}
                                    </span>
                                    {isSelf && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-background/60">
                                            <MoreVertical className="h-3.5 w-3.5" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => handleEdit(m)}>
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDeleteClick(m.id)
                                            }
                                            className="text-destructive">
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          {isSelf && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user?.profileImage}
                                alt={user?.username}
                              />
                              <AvatarFallback>
                                {user?.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Typing indicator */}
            <div className="px-4 pb-1 text-xs text-muted-foreground min-h-[20px]">
              {Object.keys(typingUsers).length > 0 && (
                <div>
                  {Object.values(typingUsers).slice(0, 3).join(", ")}
                  {Object.keys(typingUsers).length > 3 ? " and others" : ""} is
                  typing…
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t px-4 py-3">
              {media && (
                <div className="mb-2 inline-flex items-center gap-2 rounded-lg border p-2 bg-muted">
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt="Attached media"
                      className="h-14 w-14 object-cover rounded"
                    />
                  ) : (
                    <video src={media.url} className="h-14 w-14 rounded" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMedia(null)}
                    aria-label="Remove media">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleAttachClick}
                  disabled={uploading}
                  aria-label="Attach media">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) =>
                    void handleFileSelected(e.target.files?.[0] || null)
                  }
                />
                <div className="flex-1 relative">
                  <Textarea
                    value={text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Write a message"
                    rows={1}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="min-h-[44px] resize-none pr-16"
                    aria-label="Message input"
                  />
                  <div
                    className={cn(
                      "absolute bottom-2 right-2 text-xs",
                      text.length > MAX_MESSAGE_LENGTH * 0.9
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}>
                    {text.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={
                    sending ||
                    (!text.trim() && !media) ||
                    text.length > MAX_MESSAGE_LENGTH
                  }
                  aria-label="Send message">
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
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
