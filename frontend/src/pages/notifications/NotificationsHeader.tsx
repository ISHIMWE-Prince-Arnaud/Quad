import { MoreHorizontal, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { FilterTab } from "./useNotificationsController";

export function NotificationsHeader({
  filter,
  unreadLocalCount,
  onFilterChange,
  onMarkAllAsRead,
  onClearRead,
}: {
  filter: FilterTab;
  unreadLocalCount: number;
  onFilterChange: (tab: FilterTab) => void;
  onMarkAllAsRead: () => void;
  onClearRead: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight">Notifications</CardTitle>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClearRead}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "unread"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={cn(
              "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
              filter === tab
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
            {tab === "all" ? "All" : "Unread"}
            {tab === "unread" && unreadLocalCount > 0 && (
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
                {unreadLocalCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
