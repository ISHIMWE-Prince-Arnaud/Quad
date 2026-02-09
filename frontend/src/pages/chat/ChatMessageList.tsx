import { memo, useEffect } from "react";
import type { RefObject } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatListSkeleton } from "@/components/ui/loading";
import type { ChatMessage } from "@/types/chat";
import { AlertTriangle, MessageSquare, Edit2, Trash2 } from "lucide-react";
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
    (today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24),
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

function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in duration-500">
      <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm mb-4">
        <MessageSquare className="h-8 w-8 text-primary/80" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No messages yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Say hi to start the conversation. Your message will appear here
        instantly.
      </p>

      <div className="mt-6 w-full max-w-md space-y-3">
        <div className="flex items-start gap-3 justify-start">
          <div className="h-8 w-8 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="max-w-[75%]">
            <div className="w-fit max-w-full rounded-2xl px-4 py-2.5 shadow-sm bg-muted text-foreground">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                Try: “Hey everyone”
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-[75%]">
            <div className="w-fit max-w-full rounded-2xl px-4 py-2.5 shadow-sm bg-primary/50 text-primary-foreground">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                <span className="font-medium">Tip:</span> Press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-background/30 text-xs">
                  Enter
                </kbd>{" "}
                to send,{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-background/30 text-xs">
                  Shift
                </kbd>
                +
                <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-background/30 text-xs">
                  Enter
                </kbd>{" "}
                for a new line.
              </div>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <div className="h-3 w-3 rounded-full bg-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 animate-in fade-in duration-500">
      <div className="h-16 w-16 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-sm mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Couldn’t load chat
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Check your connection and try again.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

export type ChatMessageListProps = {
  listRef: RefObject<HTMLDivElement | null>;
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingOlder: boolean;
  hasMoreOlder: boolean;
  onLoadOlder: () => void;
  messages: ChatMessage[];
  pendingOutgoingText?: string | null;
  user: MinimalUser | null | undefined;
  onStartEdit: (m: ChatMessage) => void;
  onDeleteMessage: (id: string) => void;
};

export const ChatMessageList = memo(function ChatMessageList({
  listRef,
  loading,
  error,
  onRetry,
  loadingOlder,
  hasMoreOlder,
  onLoadOlder,
  messages,
  pendingOutgoingText,
  user,
  onStartEdit,
  onDeleteMessage,
}: ChatMessageListProps) {
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
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-6 py-4">
        {loading && <ChatListSkeleton />}

        {!loading && !pendingOutgoingText && messages.length === 0 && error && (
          <ChatErrorState onRetry={onRetry} />
        )}

        {!loading &&
          !pendingOutgoingText &&
          messages.length === 0 &&
          !error && <ChatEmptyState />}

        {!loading && messages.length > 0 && (
          <div>
            {loadingOlder && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/20 px-4 py-2 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30 [animation-delay:150ms]" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30 [animation-delay:300ms]" />
                </div>
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

              const showDaySeparator = i > 0 && !prevSameDay;
              const dayLabel = formatDayLabel(new Date(m.createdAt));

              const showAvatar = startsNewGroup;
              const showHeader = startsNewGroup;
              const showActions = isSelf;
              const bubbleBase =
                "relative w-fit max-w-full break-words rounded-[1.25rem] px-4 py-2.5 shadow-sm transition-all duration-200 group-hover:shadow-md";
              const bubbleClass = isSelf
                ? cn(
                    bubbleBase,
                    "bg-primary text-primary-foreground shadow-primary/20 border border-primary/10",
                  )
                : cn(
                    bubbleBase,
                    "bg-card text-foreground border border-border/60 hover:bg-muted/30 dark:bg-muted dark:border-transparent",
                  );

              const headerName = isSelf ? "You" : m.author.username;
              const headerTime = `${formatTimeOnly(new Date(m.createdAt))}${
                m.isEdited ? " • edited" : ""
              }`;

              return (
                <div
                  key={m.id}
                  className={cn("py-0", !startsNewGroup && "mt-1.5")}>
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
                      isSelf ? "justify-end" : "justify-start",
                    )}>
                    {!isSelf &&
                      (showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border/40 hover:scale-105 transition-transform duration-200">
                          <AvatarImage
                            src={m.author.profileImage}
                            alt={m.author.username}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                            {m.author.username?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-9 shrink-0" />
                      ))}

                    <div
                      className={cn(
                        "flex flex-col max-w-[75%] group min-w-0",
                        isSelf ? "items-end" : "items-start",
                      )}>
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
                            <span className="text-sm font-bold text-foreground">
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
                              title="Edit message">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="w-[1px] h-3 bg-border mx-0.5" />
                            <button
                              onClick={() => onDeleteMessage(m.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              title="Delete message">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {m.text && (
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {linkifyText(m.text)}
                          </div>
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
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
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

            {!!pendingOutgoingText &&
              (() => {
                const last = messages[messages.length - 1];
                const lastIsSelf = last?.author.clerkId === user?.clerkId;
                const lastSameDay = last
                  ? isSameDay(new Date(last.createdAt), new Date())
                  : false;
                const startsNewGroup = !lastIsSelf || !lastSameDay;

                const showAvatar = startsNewGroup;
                const showHeader = startsNewGroup;
                const bubbleBase =
                  "relative w-fit max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200";

                return (
                  <div
                    className={cn("py-0", !startsNewGroup && "mt-1.5")}
                    aria-live="polite">
                    <div
                      className={cn("flex items-start gap-3", "justify-end")}>
                      <div
                        className={cn(
                          "flex flex-col max-w-[75%] group min-w-0",
                          "items-end",
                        )}>
                        {showHeader && (
                          <div className="flex items-center justify-end gap-2 mb-2 w-full">
                            <span className="text-sm font-semibold text-foreground">
                              You
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            bubbleBase,
                            "bg-primary/40 text-primary-foreground opacity-80",
                          )}>
                          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {pendingOutgoingText}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
                        </div>
                      </div>

                      {showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0 opacity-80">
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
                      )}
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {!loading && messages.length === 0 && !!pendingOutgoingText && (
          <div className="pt-1">
            <div className="flex items-start gap-3 justify-end">
              <div className="flex flex-col max-w-[75%] min-w-0 items-end">
                <div className="relative w-fit max-w-full break-words rounded-2xl px-4 py-2.5 shadow-sm bg-primary/40 text-primary-foreground opacity-80">
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {pendingOutgoingText}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
                </div>
              </div>
              <Avatar className="h-8 w-8 shrink-0 opacity-80">
                <AvatarImage src={user?.profileImage} alt={user?.username} />
                <AvatarFallback>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
