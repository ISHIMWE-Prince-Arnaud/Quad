import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ChatMessage } from "@/types/chat";
import { Loader2, MoreVertical } from "lucide-react";
import { REACTION_EMOJIS } from "./constants";

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
          className="underline underline-offset-2 text-white/95 hover:text-white break-all">
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

export function ChatMessageList({
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
        <DialogContent className="max-w-4xl bg-[#0a0c10] border border-white/10">
          <div className="flex items-center justify-center">
            {lightboxMedia?.type === "image" ? (
              <img
                src={lightboxMedia.url}
                alt="Chat attachment"
                className="max-h-[80vh] w-auto rounded-2xl"
              />
            ) : lightboxMedia?.type === "video" ? (
              <video
                src={lightboxMedia.url}
                controls
                className="max-h-[80vh] w-auto rounded-2xl"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-10 text-white/60">
            No messages yet. Start the conversation!
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div>
            {loadingOlder && (
              <div className="flex items-center justify-center py-2 text-white/50">
                Loading older messages...
              </div>
            )}

            {(() => {
              const items: Array<
                | { type: "day"; key: string; label: string }
                | { type: "msg"; key: string; message: ChatMessage; index: number }
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
                      className="flex items-center justify-center py-3">
                      <div className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
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
                const showReactionPicker = editingId !== m.id;

                const bubbleBase =
                  "relative rounded-3xl px-5 py-4 shadow-sm border";
                const bubbleClass = isSelf
                  ? `${bubbleBase} bg-[#2F6DF6] text-white border-transparent`
                  : `${bubbleBase} bg-[#1A2433] text-white/90 border-white/5`;

                const headerName = isSelf ? "You" : m.author.username;
                const headerTime = `${m.timestamp}${m.isEdited ? " • edited" : ""}`;

                const reactionsSummary =
                  Array.isArray(m.reactions) && m.reactions.length > 0
                    ? m.reactions
                        .slice()
                        .sort((a, b) => b.count - a.count)
                        .map((r) => (
                          <button
                            key={r.emoji}
                            type="button"
                            onClick={() => onToggleReaction(m.id, r.emoji)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#0F1623] px-3 py-1 text-xs text-white/85 border border-white/10 hover:bg-white/5"
                            aria-label={`Toggle reaction ${r.emoji}`}>
                            <span>{r.emoji}</span>
                            <span className="tabular-nums">{r.count}</span>
                          </button>
                        ))
                    : m.reactionsCount > 0
                      ? [
                          <button
                            key="fallback"
                            type="button"
                            onClick={() =>
                              onToggleReaction(m.id, m.userReaction || "👍")
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-[#0F1623] px-3 py-1 text-xs text-white/85 border border-white/10 hover:bg-white/5"
                            aria-label="Toggle reaction">
                            <span>{m.userReaction || "👍"}</span>
                            <span className="tabular-nums">{m.reactionsCount}</span>
                          </button>,
                        ]
                      : [];

                return (
                  <div
                    key={item.key}
                    className={startsNewGroup ? "mt-6" : "mt-2"}>
                    <div
                      className={
                        isSelf
                          ? "flex justify-end gap-3"
                          : "flex justify-start gap-3"
                      }>
                      {!isSelf &&
                        (showAvatar ? (
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage
                              src={m.author.profileImage}
                              alt={m.author.username}
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
                            ? "flex flex-col items-end max-w-[80%] group"
                            : "flex flex-col items-start max-w-[80%] group"
                        }>
                        {showHeader && (
                          <div className="flex items-center gap-2 mb-2">
                            {!isSelf && (
                              <span className="text-sm font-semibold text-white/90">
                                {headerName}
                              </span>
                            )}
                            <span className="text-xs text-white/50">
                              {headerTime}
                            </span>
                            {isSelf && (
                              <span className="text-sm font-semibold text-white/90">
                                {headerName}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={bubbleClass}>
                          {showActions && (
                            <div
                              ref={
                                openActionsForId === m.id ? setActionsMenuEl : null
                              }
                              className="absolute top-2 right-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionsForId((prevId) =>
                                    prevId === m.id ? null : m.id
                                  )
                                }
                                className={
                                  openActionsForId === m.id
                                    ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15"
                                    : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/15 transition"
                                }
                                aria-haspopup="menu"
                                aria-expanded={openActionsForId === m.id}
                                aria-label="Message actions">
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openActionsForId === m.id && (
                                <div
                                  role="menu"
                                  className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0B1220] border border-white/10 shadow-xl p-1 z-20">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/5"
                                    onClick={() => {
                                      setOpenActionsForId(null);
                                      onStartEdit(m);
                                    }}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/5"
                                    onClick={() => {
                                      setOpenActionsForId(null);
                                      onDeleteMessage(m.id);
                                    }}>
                                    Delete
                                  </button>
                                </div>
                              )}
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
                                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10"
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
                              {m.text && (
                                <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                  {linkifyText(m.text)}
                                </div>
                              )}

                              {hasMedia && (
                                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
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
                            </>
                          )}
                        </div>

                        {(reactionsSummary.length > 0 || showReactionPicker) && (
                          <div
                            className={
                              isSelf
                                ? "mt-2 flex items-center justify-end gap-2"
                                : "mt-2 flex items-center justify-start gap-2"
                            }>
                            {reactionsSummary.length > 0 && (
                              <div className="flex items-center gap-2">
                                {reactionsSummary}
                              </div>
                            )}

                            {showReactionPicker && (
                              <div
                                className={
                                  "inline-flex items-center gap-1 rounded-full bg-[#0B1220] border border-white/10 p-1 shadow-sm " +
                                  "opacity-0 group-hover:opacity-100 transition"
                                }>
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => onToggleReaction(m.id, emoji)}
                                    className="h-9 w-9 rounded-full text-sm text-white/85 hover:bg-white/5"
                                    aria-label={`React with ${emoji}`}
                                    title={emoji}>
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </>
  );
}
