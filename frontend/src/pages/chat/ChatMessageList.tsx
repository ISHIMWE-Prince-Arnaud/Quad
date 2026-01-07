import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
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
  const [lightboxMedia, setLightboxMedia] = useState<
    { url: string; type: "image" | "video" } | null
  >(null);

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

      <div ref={listRef} className="h-[calc(100vh-260px)] overflow-y-auto p-4">
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
                      isSelf ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                    <div className="text-xs mb-1 opacity-80">
                      {!isSelf && m.author.username}
                    </div>

                    {editingId === m.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => onEditTextChange(e.target.value)}
                          rows={2}
                          className={cn(
                            "text-sm",
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
                          <Button size="sm" onClick={() => onSaveEdit(m.id)}>
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
                                className="max-h-96 rounded-lg cursor-pointer"
                                onClick={() => openLightbox(m.media!)}
                              />
                            ) : (
                              <video
                                src={m.media.url}
                                controls
                                className="max-h-96 rounded-lg cursor-pointer"
                                onClick={() => openLightbox(m.media!)}
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
                                      onToggleReaction(m.id, emoji)
                                    }>
                                    {emoji}
                                  </DropdownMenuItem>
                                ))}
                                {m.userReaction && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      onToggleReaction(m.id, m.userReaction!)
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
                                  <DropdownMenuItem onClick={() => onStartEdit(m)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => onDeleteMessage(m.id)}
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
    </>
  );
}
