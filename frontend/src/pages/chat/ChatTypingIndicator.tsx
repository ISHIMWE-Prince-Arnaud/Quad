export function ChatTypingIndicator({
  typingUsers,
}: {
  typingUsers: Record<string, string>;
}) {
  const count = Object.keys(typingUsers).length;
  if (count === 0) return null;

  return (
    <div className="px-6 pb-2 animate-in slide-in-from-bottom-2 duration-300">
      <div className="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-sm">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
        </div>
        <span className="leading-none">
          {Object.values(typingUsers).slice(0, 3).join(", ")}
          {count > 3 ? ` and ${count - 3} others` : ""}
          {count === 1 ? " is typing..." : " are typing..."}
        </span>
      </div>
    </div>
  );
}
