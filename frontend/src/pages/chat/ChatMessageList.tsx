import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { Loader2, MoreVertical } from "lucide-react";
import { REACTION_EMOJIS } from "./constants";

type MinimalUser = {
  clerkId: string;
  username: string;
  profileImage?: string;
};

export function ChatMessageList({
  listRef,
  loading,
  loadingOlder,
  hasMoreOlder,
  onLoadOlder,
  messages,
  user,
  virtualizer,
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
  virtualizer: Virtualizer<HTMLDivElement, Element>;
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
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="bg-black">
            {lightboxMedia?.type === "image" ? (
              <img
                src={lightboxMedia.url}
                alt="Chat attachment"
                className="max-h-[80vh] w-full object-contain"
              />
            ) : lightboxMedia?.type === "video" ? (
              <video
                src={lightboxMedia.url}
                controls
                className="max-h-[80vh] w-full object-contain"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
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
                      "flex items-start gap-4",
                      isSelf ? "flex-row-reverse" : "flex-row"
                    )}>
                    {!isSelf && (
                      <Avatar className="h-10 w-10 border-2 border-border/10">
                        <AvatarImage
                          src={m.author.profileImage}
                          alt={m.author.username}
                        />
                        <AvatarFallback className="bg-secondary text-white">
                          {m.author.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "group flex flex-col gap-2",
                        isSelf ? "items-end" : "items-start"
                      )}>
                      {!isSelf ? (
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs font-semibold text-white">
                            {m.author.username}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {m.timestamp}
                            {m.isEdited ? " • edited" : ""}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-1 justify-end">
                          <span className="text-[10px] text-white/40">
                            {m.timestamp}
                            {m.isEdited ? " • edited" : ""}
                          </span>
                          <span className="text-[10px] text-white/60">You</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[86%] rounded-3xl px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] border",
                          isSelf
                            ? "bg-[#2563eb] text-white border-[#2563eb]/20"
                            : "bg-[#0f121a]/70 text-[#f1f5f9] border-white/5"
                        )}>
                        {editingId === m.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => onEditTextChange(e.target.value)}
                              rows={2}
                              className={cn(
                                "text-sm w-full rounded-md bg-background/60 border border-white/10 p-2",
                                isSelf ? "text-primary-foreground" : undefined
                              )}
                            />
                            <div className="flex gap-2 justify-end">
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
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {m.text}
                              </div>
                            )}
                            {m.media && (
                              <div className="mt-4 overflow-hidden rounded-2xl bg-white border border-white/10">
                                {m.media.type === "image" ? (
                                  <img
                                    src={m.media.url}
                                    alt="attachment"
                                    className="max-h-[420px] w-full object-contain cursor-pointer hover:opacity-95 transition"
                                    onClick={() => openLightbox(m.media!)}
                                  />
                                ) : (
                                  <video
                                    src={m.media.url}
                                    controls
                                    className="max-h-[420px] w-full object-contain cursor-pointer"
                                    onClick={() => openLightbox(m.media!)}
                                  />
                                )}
                              </div>
                            )}
                            {isSelf && (
                              <div className="relative inline-flex" ref={actionsMenuRef}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenActionsForId((prev) =>
                                      prev === m.id ? null : m.id
                                    )
                                  }
                                  className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-background/60"
                                  aria-haspopup="menu"
                                  aria-expanded={openActionsForId === m.id}>
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>

                                {openActionsForId === m.id && (
                                  <div
                                    role="menu"
                                    className={cn(
                                      "absolute right-0 mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                                      "border-white/10 bg-[#0f121a]"
                                    )}>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-white/5"
                                      onClick={() => {
                                        setOpenActionsForId(null);
                                        onStartEdit(m);
                                      }}>
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      role="menuitem"
                                      className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-white/5 text-destructive"
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
                          </>
                        )}
                      </div>

                      <div
                        className={cn(
                          "flex items-center w-full",
                          isSelf ? "justify-end" : "justify-between"
                        )}>
                        {!isSelf ? (
                          <>
                            <div className="flex items-center gap-2">
                              {Array.isArray(m.reactions) && m.reactions.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  {m.reactions
                                    .slice()
                                    .sort((a, b) => b.count - a.count)
                                    .map((r) => {
                                      const active = m.userReaction === r.emoji;
                                      return (
                                        <button
                                          key={r.emoji}
                                          type="button"
                                          onClick={() => onToggleReaction(m.id, r.emoji)}
                                          className={cn(
                                            "h-7 inline-flex items-center gap-1.5 rounded-full px-3 border text-[11px]",
                                            "bg-white/[0.04] border-white/10 text-white/90 hover:bg-white/[0.06]",
                                            active && "border-[#2563eb]/40 bg-[#2563eb]/10"
                                          )}
                                          aria-label={`Toggle reaction ${r.emoji}`}>
                                          <span className="leading-none">{r.emoji}</span>
                                          <span className="text-white/60">{r.count}</span>
                                        </button>
                                      );
                                    })}
                                </div>
                              ) : (
                                m.reactionsCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onToggleReaction(m.id, m.userReaction || "👍")
                                    }
                                    className={cn(
                                      "h-7 inline-flex items-center gap-1.5 rounded-full px-3 border text-[11px]",
                                      "bg-white/[0.04] border-white/10 text-white/90 hover:bg-white/[0.06]"
                                    )}
                                    aria-label="Toggle reaction">
                                    <span className="leading-none">
                                      {m.userReaction || "👍"}
                                    </span>
                                    <span className="text-white/60">
                                      {m.reactionsCount}
                                    </span>
                                  </button>
                                )
                              )}
                            </div>

                            <div className="flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/10 p-1">
                              {REACTION_EMOJIS.map((emoji) => {
                                const active = m.userReaction === emoji;
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => onToggleReaction(m.id, emoji)}
                                    className={cn(
                                      "h-7 w-8 inline-flex items-center justify-center rounded-full text-[12px] transition-colors",
                                      "hover:bg-white/[0.06]",
                                      active && "bg-[#2563eb]/20"
                                    )}
                                    aria-label={`React with ${emoji}`}
                                    title={emoji}>
                                    {emoji}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                className="h-7 w-8 inline-flex items-center justify-center rounded-full text-[12px] text-white/60 hover:bg-white/[0.06]"
                                aria-label="More reactions"
                                title="More">
                                +
                              </button>
                            </div>
                          </>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>

                    {isSelf && (
                      <Avatar className="h-10 w-10 border-2 border-[#2563eb]/20">
                        <AvatarImage
                          src={user?.profileImage}
                          alt={user?.username}
                        />
                        <AvatarFallback className="bg-[#2563eb] text-white">
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
    </>
  );
}
