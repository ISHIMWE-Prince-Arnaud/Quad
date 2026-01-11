import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import { Switch } from "@/components/ui/switch";

export function RightPanel() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <div className="h-full overflow-y-auto bg-[#0a0c10] border-l border-white/5">
      <div className="min-h-full p-6 flex flex-col">
        <div className="space-y-8">
          <FeaturedPoll />
          <WhoToFollow limit={5} />
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#64748b]">Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun
                className={cn(
                  "w-3.5 h-3.5",
                  !isDarkMode ? "text-white" : "text-[#64748b]"
                )}
              />
              <Switch
                checked={isDarkMode}
                onChange={() => toggleDarkMode()}
                className="bg-[#2563eb]"
              />
              <Moon
                className={cn(
                  "w-3.5 h-3.5",
                  isDarkMode ? "text-white" : "text-[#64748b]"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
