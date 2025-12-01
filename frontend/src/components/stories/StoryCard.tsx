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
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Story } from "@/types/story";
import toast from "react-hot-toast";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";
import { BookmarkService } from "@/services/bookmarkService";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { motion } from "framer-motion";

interface StoryCardProps {
  story: Story;
  onDelete?: (storyId: string) => void;
  className?: string;
}

export function StoryCard({ story, onDelete, className }: StoryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === story.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(
    story.reactionsCount || 0
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

  const displayName = story.author.username;

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
    onDelete(story._id);
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    // Initialize bookmark state
    setBookmarked(BookmarkService.isBookmarked(story._id));

    // Fetch user reaction for this story
    (async () => {
      try {
        const res = await ReactionService.getByContent("story", story._id);
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
        // Silent fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [story._id]);

  const handleCopyLink = async () => {
    const path = `/app/stories/${story._id}`;
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
        await shareFn({ url, title: story.title });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Story link copied to clipboard");
      }
    } catch (e) {
      console.error("Failed to copy link:", e);
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/stories/${story._id}/edit`);
  };

  const handleSelectReaction = async (type: ReactionType) => {
    if (reactionPending) return;
    setReactionPending(true);

    const prevType = userReaction;
    const prevCount = reactionCount;
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
      const res = await ReactionService.toggle("story", story._id, type);
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
    const next = BookmarkService.toggle(story._id);
    setBookmarked(next);
    toast[next ? "success" : "success"](
      next ? "Saved to bookmarks" : "Removed from bookmarks"
    );
  };

  return (
    <>
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={{
          rest: { y: 0, scale: 1 },
          hover: { y: -8, scale: 1.01 },
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}>
        <Card
          className={cn(
            "w-full transition-shadow duration-300 overflow-hidden",
            "hover:shadow-lg",
            className
          )}>
          <CardHeader className="pb-2 px-4 pt-3">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">
                {timeAgo(story.createdAt)}
              </span>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/app/stories/${story._id}`}>View story</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    Copy link
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        Edit story
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}>
                        Delete story
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <>
                      <DropdownMenuItem>Report story</DropdownMenuItem>
                      <DropdownMenuItem>
                        Block {story.author.username}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {/* Story content */}
          <CardContent className="p-0">
            {/* Cover image */}
            {story.coverImage && (
              <Link to={`/app/stories/${story._id}`} className="block">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>
            )}

            {/* Title and excerpt */}
            <div className="p-4 space-y-2">
              <Link
                to={`/app/stories/${story._id}`}
                className="block space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                  {story.title}
                </h3>
                {story.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {story.excerpt}
                  </p>
                )}
              </Link>

              {/* Author info and metadata */}
              <div className="flex items-center gap-2 pt-2">
                <Link
                  to={`/app/profile/${story.author.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={story.author.profileImage} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {displayName.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {displayName}
                  </span>
                </Link>
                {story.readTime && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {story.readTime} min read
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>

          {/* Interaction buttons */}
          <CardFooter className="px-4 pb-3 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-3">
              <ReactionPicker
                onSelect={handleSelectReaction}
                trigger={
                  <button
                    type="button"
                    disabled={reactionPending}
                    className={cn(
                      "flex items-center gap-1 hover:text-pink-600 transition-colors",
                      userReaction && "text-pink-600"
                    )}>
                    <span>{selectedEmoji}</span>
                    <span>{reactionCount}</span>
                  </button>
                }
              />

              <Link
                to={`/app/stories/${story._id}`}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{story.commentsCount || 0}</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="hover:text-green-600 transition-colors">
                <Share2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleToggleBookmark}
                className={cn(
                  "transition-colors",
                  bookmarked ? "text-amber-600" : "hover:text-amber-600"
                )}>
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete story?"
        description="This action cannot be undone. This will permanently delete your story."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
