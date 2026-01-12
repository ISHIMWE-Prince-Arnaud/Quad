import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { Loader2, MoreVertical } from "lucide-react";

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
        className="h-[calc(100vh-220px)] overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
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
                        "flex flex-col gap-1",
                        isSelf ? "items-end" : "items-start"
                      )}>
                      {!isSelf && (
                        <span className="text-xs font-semibold text-[#64748b] ml-1">
                          {m.author.username}
                        </span>
                      )}

                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                          isSelf
                            ? "bg-[#2563eb] text-white rounded-tr-none"
                            : "bg-[#1e293b] text-[#f1f5f9] rounded-tl-none"
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
                              <div className="whitespace-pre-wrap text-sm">
                                {m.text}
                              </div>
                            )}
                            {m.media && (
                              <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
                                {m.media.type === "image" ? (
                                  <img
                                    src={m.media.url}
                                    alt="attachment"
                                    className="max-h-[300px] w-full object-cover cursor-pointer hover:opacity-95 transition"
                                    onClick={() => openLightbox(m.media!)}
                                  />
                                ) : (
                                  <video
                                    src={m.media.url}
                                    controls
                                    className="max-h-[300px] w-full object-cover cursor-pointer"
                                    onClick={() => openLightbox(m.media!)}
                                  />
                                )}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-[10px] opacity-60">
                              <span>
                                {m.timestamp}
                                {m.isEdited ? " • edited" : ""}
                              </span>
                            </div>
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
