import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function FollowersModalSearch({
  searchQuery,
  onSearchQueryChange,
  type,
}: {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  type: "followers" | "following" | "mutual";
}) {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder={`Search ${type}...`}
          className="pl-10"
        />
      </div>
    </div>
  );
}
