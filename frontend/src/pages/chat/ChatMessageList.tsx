import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ChatMessage } from "@/types/chat";
import {
  Loader2,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MinimalUser = {
  clerkId: string;
  username: string;
  profileImage?: string;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDayLabel = (date: Date) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (isSameDay(date, todayStart)) return "Today";
  if (isSameDay(date, yesterdayStart)) return "Yesterday";

  const sameYear = date.getFullYear() === now.getFullYear();
  const fmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return fmt.format(date);
};

const URL_REGEX =
  /(https?:\/\/(?:www\.)?[\w.-]+(?::[0-9]+)?(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?)/gi;

const linkifyText = (text: string) => {
  const parts = text.split(URL_REGEX);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <a
          key={`url-${idx}-${part}`}
          href={part}
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2 text-primary hover:text-primary/80 break-all font-medium">
          {part}
        </a>
      );
    }
    return (
      <span key={`txt-${idx}`} className="break-words">
        {part}
      </span>
    );
  });
};

function ChatMessageListSkeleton() {
  return (
    <div className="py-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={`skel-${i}`}>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex flex-col items-start max-w-[72%] w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-14 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="rounded-3xl bg-muted/50 px-4 py-3 w-full animate-pulse">
                <div className="h-4 w-[85%] rounded bg-muted-foreground/10" />
                <div className="mt-2 h-4 w-[62%] rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>
          <div className="flex items-start justify-end gap-3 mt-6">
            <div className="flex flex-col items-end max-w-[72%] w-full">
              <div className="rounded-3xl bg-primary/10 px-4 py-3 w-full animate-pulse">
                <div className="h-4 w-[78%] rounded bg-primary/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in duration-500">
      <div className="h-16 w-16 rounded-3xl bg-muted/50 border border-border flex items-center justify-center shadow-sm mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No messages yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Start the conversation by sending your first message.
      </p>
      <div className="mt-6 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary">
        Tip: Press Enter to send
      </div>
    </div>
  );
}

export const ChatMessageList = memo(function ChatMessageList({
  listRef,
  loading,
  loadingOlder,
  hasMoreOlder,
  onLoadOlder,
  messages,
  user,
  editingId,
  editText,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleReaction,
  onDeleteMessage,
}: {
  listRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  loadingOlder: boolean;
  hasMoreOlder: boolean;
  onLoadOlder: () => void;
  messages: ChatMessage[];
  user: MinimalUser | null | undefined;
  editingId: string | null;
  editText: string;
  onEditTextChange: (v: string) => void;
  onStartEdit: (m: ChatMessage) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onDeleteMessage: (id: string) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);

  const [openActionsForId, setOpenActionsForId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);

  const setActionsMenuEl = useCallback((el: HTMLDivElement | null) => {
    actionsMenuRef.current = el;
  }, []);

  const openLightbox = (media: { url: string; type: "image" | "video" }) => {
    setLightboxMedia(media);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const container = listRef.current;
    if (!container || !hasMoreOlder || loadingOlder) return;

    const handleScroll = () => {
      // Load more when scrolled within 200px of the top
      if (container.scrollTop < 200) {
        onLoadOlder();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreOlder, loadingOlder, onLoadOlder, listRef]);

  useEffect(() => {
    if (!openActionsForId) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (actionsMenuRef.current?.contains(target)) return;
      setOpenActionsForId(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenActionsForId(null);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openActionsForId]);

  return (
    <>
      <Dialog
        open={lightboxOpen}
        onOpenChange={(open) => {
          setLightboxOpen(open);
          if (!open) setLightboxMedia(null);
        }}>
        <DialogContent className="max-w-4xl bg-black/95 border-none p-0 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-center w-full h-full min-h-[50vh] relative">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-50">
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            {lightboxMedia?.type === "image" ? (
              <img
                src={lightboxMedia.url}
                alt="Chat attachment"
                className="max-h-[90vh] w-auto animate-in zoom-in-95 duration-200"
              />
            ) : lightboxMedia?.type === "video" ? (
              <video
                src={lightboxMedia.url}
                controls
                className="max-h-[90vh] w-auto rounded-lg"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
        {loading && <ChatMessageListSkeleton />}

        {!loading && messages.length === 0 && <ChatEmptyState />}

        {!loading && messages.length > 0 && (
          <div>
            {loadingOlder && (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs font-medium">
                  Loading older messages...
                </span>
              </div>
            )}

            {(() => {
              const items: Array<
                | { type: "day"; key: string; label: string }
                | {
                    type: "msg";
                    key: string;
                    message: ChatMessage;
                    index: number;
                  }
              > = [];

              for (let i = 0; i < messages.length; i += 1) {
                const m = messages[i];
                const prev = i > 0 ? messages[i - 1] : undefined;
                const day = new Date(m.createdAt);
                const prevDay = prev ? new Date(prev.createdAt) : null;
                const startsNewDay = !prevDay || !isSameDay(day, prevDay);

                if (startsNewDay) {
                  items.push({
                    type: "day",
                    key: `day-${day.toISOString()}`,
                    label: formatDayLabel(day),
                  });
                }

                items.push({ type: "msg", key: m.id, message: m, index: i });
              }

              return items.map((item) => {
                if (item.type === "day") {
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-center py-6">
                      <div className="rounded-full bg-muted/50 border border-border px-3 py-1 text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                        {item.label}
                      </div>
                    </div>
                  );
                }

                const m = item.message;
                const i = item.index;
                const prev = i > 0 ? messages[i - 1] : undefined;
                const isSelf = m.author.clerkId === user?.clerkId;
                const media = m.media;
                const hasMedia =
                  !!media &&
                  typeof media.url === "string" &&
                  media.url.trim().length > 0 &&
                  (media.type === "image" || media.type === "video");

                const prevSameAuthor =
                  !!prev && prev.author.clerkId === m.author.clerkId;
                const prevSameDay =
                  !!prev &&
                  isSameDay(new Date(prev.createdAt), new Date(m.createdAt));
                const startsNewGroup = !prevSameAuthor || !prevSameDay;

                const showAvatar = startsNewGroup;
                const showHeader = startsNewGroup;
                const showActions = isSelf && editingId !== m.id;
                const bubbleBase =
                  "relative rounded-3xl px-4 py-3 shadow-sm transition-all duration-200 group-hover:shadow-md";
                const bubbleClass = isSelf
                  ? cn(bubbleBase, "bg-primary text-primary-foreground")
                  : cn(
                      bubbleBase,
                      "bg-muted text-foreground hover:bg-muted/70"
                    );

                const headerName = isSelf ? "You" : m.author.username;
                const headerTime = `${m.timestamp}${
                  m.isEdited ? " • edited" : ""
                }`;
                const showReactionPill = m.reactionsCount > 0;
                const reactionPillPosition = isSelf
                  ? "absolute -bottom-3 left-4"
                  : "absolute -bottom-3 right-4";

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    key={item.key}
                    className={startsNewGroup ? "mt-6" : "mt-2"}>
                    <div
                      className={
                        isSelf
                          ? "flex justify-end items-start gap-3"
                          : "flex justify-start items-start gap-3"
                      }>
                      {!isSelf &&
                        (showAvatar ? (
                          <Avatar className="h-9 w-9 shrink-0 shadow-sm border border-border/40">
                            <AvatarImage
                              src={m.author.profileImage}
                              alt={m.author.username}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {m.author.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-9 shrink-0" />
                        ))}

                      <div
                        className={
                          isSelf
                            ? "flex flex-col items-end max-w-[72%] group"
                            : "flex flex-col items-start max-w-[72%] group"
                        }>
                        {showHeader && (
                          <div
                            className={
                              isSelf
                                ? "flex items-center justify-end gap-2 mb-2 w-full"
                                : "flex items-center justify-start gap-2 mb-2 w-full"
                            }>
                            {!isSelf && (
                              <span className="text-sm font-semibold text-foreground">
                                {headerName}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground/60 tabular-nums">
                              {headerTime}
                            </span>
                            {isSelf && (
                              <span className="text-sm font-semibold text-foreground">
                                {headerName}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={bubbleClass}>
                          {showActions && (
                            <div
                              ref={
                                openActionsForId === m.id
                                  ? setActionsMenuEl
                                  : null
                              }
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionsForId((prevId) =>
                                    prevId === m.id ? null : m.id
                                  )
                                }
                                className={cn(
                                  "inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm transition-colors",
                                  openActionsForId === m.id
                                    ? "bg-background/40"
                                    : "hover:bg-background/30"
                                )}
                                aria-haspopup="menu"
                                aria-expanded={openActionsForId === m.id}
                                aria-label="Message actions">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </button>

                              <AnimatePresence>
                                {openActionsForId === m.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                    role="menu"
                                    className="absolute right-0 mt-1 w-32 rounded-xl bg-popover border border-border shadow-xl p-1 z-20 overflow-hidden">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                      onClick={() => {
                                        setOpenActionsForId(null);
                                        onStartEdit(m);
                                      }}>
                                      <Edit2 className="h-3 w-3" />
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                      onClick={() => {
                                        setOpenActionsForId(null);
                                        onDeleteMessage(m.id);
                                      }}>
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}

                          {editingId === m.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editText}
                                onChange={(e) =>
                                  onEditTextChange(e.target.value)
                                }
                                rows={2}
                                className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={onCancelEdit}>
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => onSaveEdit(m.id)}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {hasMedia && (
                                <div
                                  className={
                                    (m.text
                                      ? "-mx-4 -mt-3 rounded-t-3xl"
                                      : "-mx-4 -mt-3 rounded-3xl") +
                                    " overflow-hidden"
                                  }>
                                  {media.type === "image" ? (
                                    <img
                                      src={media.url}
                                      alt="attachment"
                                      className="w-full max-h-[360px] object-cover cursor-pointer"
                                      onClick={() => openLightbox(media)}
                                    />
                                  ) : (
                                    <video
                                      src={media.url}
                                      controls
                                      className="w-full max-h-[360px] object-contain"
                                    />
                                  )}
                                </div>
                              )}

                              {m.text && (
                                <div
                                  className={
                                    "text-[15px] leading-relaxed whitespace-pre-wrap break-words" +
                                    (hasMedia ? " mt-3" : "")
                                  }>
                                  {linkifyText(m.text)}
                                </div>
                              )}
                            </>
                          )}

                          {showReactionPill && (
                            <button
                              type="button"
                              onClick={() => onToggleReaction(m.id, "❤️")}
                              className={cn(
                                reactionPillPosition,
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 shadow-sm transition-transform hover:scale-105",
                                isSelf
                                  ? "bg-background border border-border"
                                  : "bg-background border border-border"
                              )}
                              aria-label={`Reactions: ${m.reactionsCount}`}>
                              <span className="text-xs leading-none">❤️</span>
                              <span className="text-[10px] tabular-nums font-bold text-foreground">
                                {m.reactionsCount}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isSelf &&
                        (showAvatar ? (
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage
                              src={user?.profileImage}
                              alt={user?.username}
                            />
                            <AvatarFallback>
                              {user?.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-9 shrink-0" />
                        ))}
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </>
  );

});
