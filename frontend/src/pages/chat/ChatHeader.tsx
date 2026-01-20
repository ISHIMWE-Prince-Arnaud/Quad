export function ChatHeader() {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 min-w-[180px]">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">
            Global Chat
          </h1>
        </div>
      </div>
    </div>
  );
}
