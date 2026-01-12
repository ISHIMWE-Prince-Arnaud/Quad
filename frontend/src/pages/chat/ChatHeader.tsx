import { Bell, Search } from "lucide-react";

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

      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full h-9 rounded-full bg-white/[0.04] border border-white/5 pl-9 pr-3 text-sm text-white placeholder-[#64748b] outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/60"
            aria-label="Search messages"
          />
        </div>
      </div>

      <div className="flex items-center justify-end min-w-[180px]">
        <button
          type="button"
          className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/[0.04] border border-white/5 text-[#94a3b8] hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/60"
          aria-label="Notifications"
          title="Notifications">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
