import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaGallery } from "./MediaGallery";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  className?: string;
  isSingleView?: boolean;
}

export function PostCard({
  post,
  onDelete,
  className,
  isSingleView = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === post.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { firstName, lastName, username } = post.author;

  const displayName =
    // Prefer full name when available (optional on author)
    firstName && lastName ? `${firstName} ${lastName}` : firstName || username;

  const MAX_PREVIEW_LENGTH = 280;
  const fullText = post.text ?? "";
  const hasLongText = fullText.length > MAX_PREVIEW_LENGTH;
  const previewText = hasLongText
    ? `${fullText.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}...`
    : fullText;

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(post._id);
    setIsDeleteDialogOpen(false);
  };

  const handleCopyLink = async () => {
    const path = `/app/posts/${post._id}`;
    const url = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/posts/${post._id}/edit`);
  };

  return (
    <>
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
                  {displayName.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm truncate max-w-[180px]">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{post.author.username}
                  <span className="mx-1">·</span>
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
                <DropdownMenuItem onClick={handleCopyLink}>
                  Copy link
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={handleEdit}>
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}>
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
          {fullText && (
            <Link to={`/app/posts/${post._id}`} className="block">
              <p className="text-sm whitespace-pre-wrap break-words">
                {isSingleView || !hasLongText ? fullText : previewText}
                {!isSingleView && hasLongText && (
                  <span className="ml-1 text-primary font-medium">
                    See more
                  </span>
                )}
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

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              post and remove it from feeds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
