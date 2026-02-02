import { memo, useEffect } from "react";
import type { RefObject } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/chat";
import {
  Loader2,
  MessageSquare,
  Edit2,
  Trash2,
} from "lucide-react";
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

const formatDayLabel = (d: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
};

const formatTimeOnly = (d: Date) =>
  d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

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
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex flex-col items-start max-w-[75%] md:max-w-[60%] w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-14 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="rounded-2xl bg-muted/50 px-4 py-2.5 w-full animate-pulse">
                <div className="h-4 w-[85%] rounded bg-muted-foreground/10" />
                <div className="mt-2 h-4 w-[62%] rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>
          <div className="flex items-start justify-end gap-3 mt-6">
            <div className="flex flex-col items-end max-w-[75%] md:max-w-[60%] w-full">
              <div className="rounded-2xl bg-primary/10 px-4 py-2.5 w-full animate-pulse">
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
  onDeleteMessage: (id: string) => void;
}) {
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
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto scrollbar-hide">
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

            {messages.map((m, i) => {
              const prev = i > 0 ? messages[i - 1] : undefined;
                const isSelf = m.author.clerkId === user?.clerkId;

                const prevSameAuthor =
                  !!prev && prev.author.clerkId === m.author.clerkId;
                const prevSameDay =
                  !!prev &&
                  isSameDay(new Date(prev.createdAt), new Date(m.createdAt));
                const startsNewGroup = !prevSameAuthor || !prevSameDay;

                const showDaySeparator = !prevSameDay;
                const dayLabel = formatDayLabel(new Date(m.createdAt));

                const showAvatar = startsNewGroup;
                const showHeader = startsNewGroup;
                const showActions = isSelf && editingId !== m.id;
                const bubbleBase =
                  "relative rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 group-hover:shadow-md";
                const bubbleClass = isSelf
                  ? cn(bubbleBase, "bg-primary/50 text-primary-foreground")
                  : cn(
                      bubbleBase,
                      "bg-muted text-foreground hover:bg-muted/70"
                    );

                const headerName = isSelf ? "You" : m.author.username;
                const headerTime = `${formatTimeOnly(new Date(m.createdAt))}${
                  m.isEdited ? " • edited" : ""
                }`;

              return (
                <div key={m.id} className="py-0.5">
                  {showDaySeparator && (
                    <div className="flex items-center justify-center py-3">
                      <div className="h-px flex-1 bg-border/60" />
                      <div className="mx-3 text-[11px] font-medium text-muted-foreground/70 bg-background/70 border border-border/50 px-3 py-1 rounded-full tabular-nums">
                        {dayLabel}
                      </div>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex items-start gap-3",
                      isSelf ? "justify-end" : "justify-start"
                    )}>
                    {!isSelf &&
                      (showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border/40">
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
                          ? "flex flex-col items-end max-w-[75%] md:max-w-[60%] group"
                          : "flex flex-col items-start max-w-[75%] md:max-w-[60%] group"
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
                          <div className="absolute -top-3 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 flex items-center gap-0.5 bg-background border border-border shadow-sm rounded-full p-1 pr-2">
                            <button
                              onClick={() => onStartEdit(m)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                              title="Edit message"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="w-[1px] h-3 bg-border mx-0.5" />
                            <button
                              onClick={() => onDeleteMessage(m.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
                            {m.text && (
                              <div
                                className={
                                  "text-[15px] leading-relaxed whitespace-pre-wrap break-words"
                                }>
                                {linkifyText(m.text)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isSelf &&
                      (showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0">
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
            })}
          </div>
        )}
      </div>
    </>
  );
});
