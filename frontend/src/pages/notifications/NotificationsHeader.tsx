import { MoreHorizontal, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold tracking-tight">
              Notifications
            </CardTitle>
            {unreadLocalCount > 0 && (
              <Badge variant="destructive" className="h-5 px-2 text-[11px]">
                {unreadLocalCount > 99 ? "99+" : unreadLocalCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              disabled={unreadLocalCount === 0}
              className="transition-all hover:text-primary hover:bg-primary/10 hover:shadow-sm hover:border-primary">
              <Check className="h-4 w-4" />
              Mark all read
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearRead}
              className="transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 hover:shadow-sm">
              <Trash2 className="h-4 w-4" />
              Clear read
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:hidden">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onMarkAllAsRead}
                disabled={unreadLocalCount === 0}
                className="focus:bg-accent/70">
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onClearRead}
                className="focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unread"] as FilterTab[]).map((tab) => {
          const isActive = filter === tab;

          return (
            <Button
              key={tab}
              type="button"
              onClick={() => onFilterChange(tab)}
              variant={isActive ? "default" : "secondary"}
              size="sm"
              aria-pressed={isActive}
              className={cn("rounded-full", !isActive && "hover:bg-muted")}>
              {tab === "all" ? "All" : "Unread"}
              {tab === "unread" && unreadLocalCount > 0 && (
                <span
                  className={cn(
                    "ml-2 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full px-2 text-[11px] font-semibold",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : "bg-background text-foreground",
                  )}
                  aria-label={`${unreadLocalCount} unread`}>
                  {unreadLocalCount > 99 ? "99+" : unreadLocalCount}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
