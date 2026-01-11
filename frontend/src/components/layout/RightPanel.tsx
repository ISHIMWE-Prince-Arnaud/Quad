import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";

export function RightPanel() {
  const { effectiveTheme, setTheme } = useThemeStore();

  return (
    <div className="h-full bg-[#0a0c10] border-l border-white/5 flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain p-6">
        <div className="space-y-8">
          <FeaturedPoll />
          <WhoToFollow limit={5} />
        </div>
      </div>

      <div className="p-6 pt-4 border-t border-white/5 bg-[#0a0c10]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a0c10]/70">
          <div
            role="group"
            aria-label="Theme"
            className="flex items-center justify-between rounded-full bg-white/[0.04] border border-white/5 p-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={effectiveTheme === "light"}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]",
                effectiveTheme === "light"
                  ? "bg-[#2563eb] text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]"
                  : "text-[#94a3b8] hover:text-white"
              )}
              title="Light">
              <Sun className="h-4 w-4" />
              Light
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={effectiveTheme === "dark"}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]",
                effectiveTheme === "dark"
                  ? "bg-[#2563eb] text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]"
                  : "text-[#94a3b8] hover:text-white"
              )}
              title="Dark">
              <Moon className="h-4 w-4" />
              Dark
            </button>
        </div>
      </div>
    </div>
  );
}
