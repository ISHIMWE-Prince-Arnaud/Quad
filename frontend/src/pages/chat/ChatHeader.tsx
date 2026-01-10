import { Search, MoreVertical } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/10 bg-[#0f121a]/50 backdrop-blur-md sticky top-0 z-10">
      <h1 className="text-lg font-bold text-white tracking-tight">
        General Chat
      </h1>
      <div className="flex items-center gap-4 text-[#64748b]">
        <button className="hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
