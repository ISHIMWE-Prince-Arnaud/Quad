export function ChatTypingIndicator({
  typingUsers,
}: {
  typingUsers: Record<string, string>;
}) {
  const count = Object.keys(typingUsers).length;
  if (count === 0) return null;

  return (
    <div className="px-6 pb-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:120ms]" />
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:240ms]" />
        </div>
        <span>
          {Object.values(typingUsers).slice(0, 3).join(", ")}
          {count > 3 ? " and others" : ""} is typing...
        </span>
      </div>
    </div>
  );
}
