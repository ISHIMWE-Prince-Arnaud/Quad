import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";
import { ThemeSelector } from "../theme/ThemeSelector";

export function RightPanel() {
  return (
    <div className="h-full bg-[#0a0c10] border-l border-white/5 flex flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain p-6">
        <div className="space-y-8">
          <FeaturedPoll />
          <WhoToFollow limit={5} />
        </div>
      </div>

      <ThemeSelector />
    </div>
  );
}
