import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";

export function RightPanel() {
  return (
    <div className="h-full overflow-y-auto bg-[#0a0c10] border-l border-white/5">
      <div className="p-6 space-y-8">
        <FeaturedPoll />
        <WhoToFollow limit={5} />
      </div>
    </div>
  );
}
