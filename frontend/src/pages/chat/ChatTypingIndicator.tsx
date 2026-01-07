export function ChatTypingIndicator({
  typingUsers,
}: {
  typingUsers: Record<string, string>;
}) {
  return (
    <div className="px-4 pb-1 text-xs text-muted-foreground min-h-[20px]">
      {Object.keys(typingUsers).length > 0 && (
        <div>
          {Object.values(typingUsers).slice(0, 3).join(", ")}
          {Object.keys(typingUsers).length > 3 ? " and others" : ""} is typing…
        </div>
      )}
    </div>
  );
}
