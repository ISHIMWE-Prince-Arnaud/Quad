import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function PollsHeader() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-xl font-semibold">Polls</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <Link to="/app/create/poll">Create poll</Link>
        </Button>
      </div>
    </div>
  );
}
