import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/timeUtils";
import type { Post } from "@/types/post";

export function PostCardHeader({
  post,
  displayName,
  isOwner,
  onCopyLink,
  onEdit,
  onRequestDelete,
}: {
  post: Post;
  displayName: string;
  isOwner: boolean;
  onCopyLink: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <Link
        to={`/app/profile/${post.author.username}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={post.author.profileImage} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {displayName.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="truncate">@{post.author.username}</span>
            <span>·</span>
            <span className="whitespace-nowrap">{timeAgo(post.createdAt)}</span>
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            aria-label="Post options">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/app/posts/${post._id}`}>View post</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyLink}>Copy link</DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit post</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={onRequestDelete}>
                Delete post
              </DropdownMenuItem>
            </>
          )}
          {!isOwner && (
            <>
              <DropdownMenuItem>Report post</DropdownMenuItem>
              <DropdownMenuItem>Block {post.author.username}</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
