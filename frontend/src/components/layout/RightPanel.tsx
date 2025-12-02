import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";

export function RightPanel() {
  return (
    <div className="h-full overflow-y-auto bg-background border-l border-border">
      <div className="p-4 space-y-6">
        <FeaturedPoll />
        <WhoToFollow limit={3} />
      </div>
    </div>
  );
}
