import { Share2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="h-8 w-8 p-0 rounded-full text-[#94a3b8] hover:text-white hover:bg-white/5"
          aria-label="Copy story link">
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full text-[#94a3b8] hover:text-white hover:bg-white/5"
                aria-label="Story options">
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[180px] rounded-xl border border-white/10 bg-[#0b1220] p-1 shadow-xl">
              <DropdownMenuItem
                onClick={onEdit}
                className="rounded-lg px-3 py-2 text-[13px] text-[#e2e8f0] focus:bg-white/5 focus:text-white">
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit story
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="rounded-lg px-3 py-2 text-[13px] text-[#ef4444] focus:bg-white/5 focus:text-[#ef4444]">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
