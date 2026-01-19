 

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5 bg-[#0f121a]/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2 min-w-[180px]">
        <h1 className="text-sm font-bold text-white tracking-tight">
          Global Chat
        </h1>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#94a3b8]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          LIVE
        </span>
      </div>

      <div className="min-w-[180px]" />
    </div>
  );
}
