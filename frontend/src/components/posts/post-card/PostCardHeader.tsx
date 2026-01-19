import { Link } from "react-router-dom";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/timeUtils";
import type { Post } from "@/types/post";

export function PostCardHeader({
  post,
  displayName,
  isOwner,
  onEdit,
  onRequestDelete,
}: {
  post: Post;
  displayName: string;
  isOwner: boolean;
  onEdit: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between group">
      <Link
        to={`/app/profile/${post.author.username}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Avatar className="h-10 w-10 border-2 border-white/5 shadow-inner">
          <AvatarImage src={post.author.profileImage} />
          <AvatarFallback className="bg-[#1e293b] text-white font-semibold">
            {displayName.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-[15px] leading-tight truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-medium text-[#64748b]">
              @{post.author.username}
            </span>
            <span className="text-[#334155] text-[10px]">·</span>
            <span className="text-[11px] font-medium text-[#64748b] whitespace-nowrap">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 shrink-0 rounded-full text-[#94a3b8] hover:text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/40 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
              aria-label="Post options">
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[180px] rounded-xl border border-white/10 bg-[#0b1220] p-1 text-white shadow-xl">
            <DropdownMenuItem
              onClick={onEdit}
              className="gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/5 focus:bg-white/5">
              <Pencil className="h-4 w-4 text-[#94a3b8]" aria-hidden="true" />
              Edit post
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem
              className="gap-2 rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              onClick={onRequestDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
