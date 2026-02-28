import {
  PiShareNetworkBold,
  PiDotsThreeBold,
  PiPencilBold,
  PiTrashBold,
} from "react-icons/pi";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StoryPageHeader({
  title,
  isOwner,
  onShare,
  onEdit,
  onDelete,
}: {
  title: string;
  isOwner: boolean;
  onShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200"
          aria-label="Copy story link">
          <PiShareNetworkBold className="h-4 w-4" aria-hidden="true" />
        </Button>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="Story options">
                <PiDotsThreeBold className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent">
                <PiPencilBold className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Edit story
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                <PiTrashBold className="h-4 w-4" aria-hidden="true" />
                Delete story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
