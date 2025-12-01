import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreHorizontal, MessageCircle, Share2, Bookmark } from "lucide-react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MediaGallery } from "./MediaGallery";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";
import { BookmarkService } from "@/services/bookmarkService";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { motion } from "framer-motion";

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
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number | undefined>(
    post.reactionsCount
  );
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionType, number>
  >({
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  });
  const [bookmarked, setBookmarked] = useState(false);

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
  const reactionEmojiMap: Record<ReactionType, string> = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😡",
  };
  const selectedEmoji = userReaction ? reactionEmojiMap[userReaction] : "👍";

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(post._id);
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    // Initialize bookmark state
    setBookmarked(BookmarkService.isBookmarked(post._id));

    // Fetch user reaction for this post (to highlight selection) and reconcile counts
    (async () => {
      try {
        const res = await ReactionService.getByContent("post", post._id);
        if (!cancelled && res.success && res.data) {
          const ur = res.data.userReaction;
          setUserReaction(ur ? ur.type : null);
          if (typeof res.data.totalCount === "number") {
            setReactionCount(res.data.totalCount);
          }

          if (Array.isArray(res.data.reactionCounts)) {
            const nextCounts: Record<ReactionType, number> = {
              like: 0,
              love: 0,
              laugh: 0,
              wow: 0,
              sad: 0,
              angry: 0,
            };
            for (const rc of res.data.reactionCounts) {
              nextCounts[rc.type] = rc.count;
            }
            setReactionCounts(nextCounts);
          }
        }
      } catch {
        // Silent fail; keep initial counts
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post._id]);

  const handleCopyLink = async () => {
    const path = `/app/posts/${post._id}`;
    const url = `${window.location.origin}${path}`;

    try {
      const shareFn = (
        navigator as unknown as {
          share?: (data: {
            url?: string;
            title?: string;
            text?: string;
          }) => Promise<void>;
        }
      ).share;
      if (typeof shareFn === "function") {
        await shareFn({ url, title: "Quad Post" });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard");
      }
    } catch (e) {
      console.error("Failed to copy link:", e);
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/posts/${post._id}/edit`);
  };

  const handleSelectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount ?? 0;
    const prevCounts = reactionCounts;

    const nextCounts: Record<ReactionType, number> = { ...prevCounts };
    if (prevType === type) {
      // Remove existing reaction of same type
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
      setUserReaction(null);
    } else {
      // If switching from another type, decrement that first
      if (prevType) {
        nextCounts[prevType] = Math.max(0, (nextCounts[prevType] ?? 0) - 1);
      }
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
      setUserReaction(type);
    }

    const nextTotal = (Object.values(nextCounts) as number[]).reduce(
      (sum, value) => sum + value,
      0
    );
    setReactionCounts(nextCounts);
    setReactionCount(nextTotal);

    try {
      const res = await ReactionService.toggle("post", post._id, type);
      if (!res.success) throw new Error(res.message || "Failed to react");

      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (err: unknown) {
      // Revert on error
      setUserReaction(prevType);
      setReactionCounts(prevCounts);
      setReactionCount(prevCount);
      let msg = "Failed to update reaction";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      toast.error(msg);
    } finally {
      setReactionPending(false);
    }
  };

  const handleToggleBookmark = () => {
    const next = BookmarkService.toggle(post._id);
    setBookmarked(next);
    toast[next ? "success" : "success"](
      next ? "Saved to bookmarks" : "Removed from bookmarks"
    );
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}>
        <Card
          className={cn(
            "w-full transition-shadow duration-200",
            "hover:shadow-lg",
            className
          )}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              {/* Author info */}
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
                  <p className="font-semibold text-sm truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="truncate">@{post.author.username}</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">
                      {timeAgo(post.createdAt)}
                    </span>
                  </p>
                </div>
              </Link>

              {/* More options */}
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
          <CardContent className="pb-4 space-y-4">
            {/* Text content */}
            {fullText && (
              <Link to={`/app/posts/${post._id}`} className="block">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {isSingleView || !hasLongText ? fullText : previewText}
                  {!isSingleView && hasLongText && (
                    <span className="ml-1 text-primary font-medium hover:underline">
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
          <CardFooter
            className="pt-3 pb-4 flex items-center gap-2 border-t"
            role="group"
            aria-label="Post actions">
            <div className="flex items-center gap-1 flex-1">
              <ReactionPicker
                onSelect={handleSelectReaction}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={reactionPending}
                    className={cn(
                      "gap-2 text-muted-foreground transition-colors",
                      userReaction
                        ? "text-pink-600"
                        : "hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
                    )}
                    aria-label={`React to post. Current reactions: ${
                      reactionCount ?? 0
                    }${
                      userReaction ? `, You reacted with ${userReaction}` : ""
                    }`}>
                    <motion.span
                      className="text-sm"
                      aria-hidden="true"
                      whileTap={{ scale: 1.2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}>
                      {selectedEmoji}
                    </motion.span>
                    <span className="text-xs font-medium" aria-hidden="true">
                      {reactionCount ?? 0}
                    </span>
                  </Button>
                }
              />
              {(Object.keys(reactionCounts) as ReactionType[]).some(
                (type) => reactionCounts[type] > 0
              ) && (
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground ml-1">
                  {(Object.keys(reactionCounts) as ReactionType[]).map(
                    (type) => {
                      const count = reactionCounts[type] ?? 0;
                      if (!count) return null;
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                          <span>{reactionEmojiMap[type]}</span>
                          <span>{count}</span>
                        </span>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              asChild>
              <Link
                to={`/app/posts/${post._id}`}
                aria-label={`View ${post.commentsCount || 0} comments`}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium" aria-hidden="true">
                  {post.commentsCount || 0}
                </span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
              aria-label="Share post">
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleBookmark}
              className={cn(
                "gap-2 text-muted-foreground transition-colors",
                bookmarked
                  ? "text-amber-600"
                  : "hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              )}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
              aria-pressed={bookmarked}>
              <motion.div
                whileTap={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                <Bookmark
                  className={cn("h-4 w-4", bookmarked && "fill-current")}
                  aria-hidden="true"
                />
              </motion.div>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete post?"
        description="This action cannot be undone. This will permanently delete your post and remove it from feeds."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
