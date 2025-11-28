import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaGallery } from "./MediaGallery";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  className?: string;
}

export function PostCard({ post, onDelete, className }: PostCardProps) {
  const isOwner = false; // TODO: Check if current user is the post owner

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post._id);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Author info */}
          <Link
            to={`/app/profile/${post.author.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.profileImage} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {post.author.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author.username}</p>
              <p className="text-xs text-muted-foreground">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </Link>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/posts/${post._id}`}>View post</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem>Edit post</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}>
                    Delete post
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <>
                  <DropdownMenuItem>Report post</DropdownMenuItem>
                  <DropdownMenuItem>
                    Block {post.author.username}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Post content */}
      <CardContent className="pb-3 space-y-3">
        {/* Text content */}
        {post.text && (
          <Link to={`/app/posts/${post._id}`} className="block">
            <p className="text-sm whitespace-pre-wrap break-words">
              {post.text}
            </p>
          </Link>
        )}

        {/* Media gallery */}
        {post.media && post.media.length > 0 && (
          <MediaGallery media={post.media} />
        )}
      </CardContent>

      {/* Interaction buttons */}
      <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-pink-600">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{post.reactionsCount || 0}</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-blue-600"
            asChild>
            <Link to={`/app/posts/${post._id}`}>
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.commentsCount || 0}</span>
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-green-600">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-amber-600">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
