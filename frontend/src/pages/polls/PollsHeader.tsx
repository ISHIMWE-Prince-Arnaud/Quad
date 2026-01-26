import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PollsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-[22px] font-bold text-white">Polls</h1>

      <Button
        asChild
        size="sm"
        className="h-9 rounded-full bg-[#2563eb] px-4 text-[12px] font-bold text-white shadow-lg shadow-[#2563eb]/20 hover:bg-[#1d4ed8]"
      >
        <Link to="/app/create/poll" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Poll
        </Link>
      </Button>
    </div>
  );
}
