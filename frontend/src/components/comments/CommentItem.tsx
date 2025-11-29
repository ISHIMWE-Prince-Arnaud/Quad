import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";
import { CommentService } from "@/services/commentService";
import { CommentComposer } from "@/components/comments/CommentComposer";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: Comment;
  onDeleted?: (id: string) => void;
}

export function CommentItem({ comment, onDeleted }: CommentItemProps) {
  const { user } = useAuthStore();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionPending, setReactionPending] = useState(false);
  const [reactionCount, setReactionCount] = useState<number>(
    comment.reactionsCount || 0
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
  const reactionEmojiMap: Record<ReactionType, string> = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😡",
  };

  const [likesCount, setLikesCount] = useState<number>(comment.likesCount || 0);
  const [liked, setLiked] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const [bodyText, setBodyText] = useState(comment.text);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [editPending, setEditPending] = useState(false);

  const [replies, setReplies] = useState<Comment[]>([]);
  const [repliesCount, setRepliesCount] = useState<number>(
    comment.repliesCount || 0
  );
  const [repliesSkip, setRepliesSkip] = useState(0);
  const [repliesLimit] = useState(10);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoadedOnce, setRepliesLoadedOnce] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);

  const isAuthor = user?.clerkId && user.clerkId === comment.author.clerkId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ReactionService.getByContent("comment", comment._id);
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
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [comment._id]);

  const handleToggleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    const prevLiked = liked;
    const prevCount = likesCount;

    try {
      setLiked(!prevLiked);
      setLikesCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));

      const res = await CommentService.toggleLike(comment._id);
      if (!res.success) {
        throw new Error(res.message || "Failed to toggle like");
      }
      setLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      const msg =
        e instanceof Error ? e.message : "Failed to update like on comment";
      toast.error(msg);
    } finally {
      setLikePending(false);
    }
  };

  const handleEdit = () => {
    setEditText(bodyText);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(bodyText);
  };

  const handleSaveEdit = async () => {
    const value = editText.trim();
    if (!value || editPending) return;
    setEditPending(true);
    try {
      const res = await CommentService.update(comment._id, value);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to update comment");
      }
      setBodyText(res.data.text);
      setIsEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update comment";
      toast.error(msg);
    } finally {
      setEditPending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await CommentService.delete(comment._id);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete comment");
      }
      onDeleted?.(comment._id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete comment";
      toast.error(msg);
    }
  };

  const loadReplies = async (reset = false) => {
    if (repliesLoading) return;
    if (!reset && !repliesHasMore && repliesLoadedOnce) return;

    try {
      setRepliesLoading(true);
      const nextSkip = reset ? 0 : repliesSkip;
      const res = await CommentService.getReplies(comment._id, {
        limit: repliesLimit,
        skip: nextSkip,
      });
      if (res.success) {
        const data = res.data || [];
        setReplies((prev) => (reset ? data : [...prev, ...data]));
        const pag = res.pagination;
        setRepliesSkip(nextSkip + data.length);
        setRepliesHasMore(Boolean(pag?.hasMore));
        setRepliesLoadedOnce(true);
      }
    } catch {
      // ignore
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleToggleRepliesOpen = () => {
    const next = !repliesOpen;
    setRepliesOpen(next);
    if (next && !repliesLoadedOnce) {
      void loadReplies(true);
    }
  };

  const handleReplyCreated = async () => {
    setRepliesCount((c) => c + 1);
    await loadReplies(true);
    setShowReplyComposer(false);
  };

  const handleReplyDeleted = (id: string) => {
    setReplies((prev) => prev.filter((r) => r._id !== id));
    setRepliesCount((c) => Math.max(0, c - 1));
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
      const res = await ReactionService.toggle("comment", comment._id, type);
      if (!res.success) throw new Error(res.message || "Failed to react");
      if (res.data === null) {
        setUserReaction(null);
      } else if (res.data) {
        setUserReaction(res.data.type);
      }
    } catch (e) {
      setUserReaction(prevType);
      setReactionCounts(prevCounts);
      setReactionCount(prevCount);
      const msg = e instanceof Error ? e.message : "Failed to update reaction";
      toast.error(msg);
    } finally {
      setReactionPending(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.profileImage} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {comment.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold truncate max-w-[160px]">
                {comment.author.username}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>· {timeAgo(comment.createdAt)}</span>
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete()}
                      className="hover:underline text-destructive">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="mt-1 space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px]"
                  maxLength={2000}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={editPending}
                    onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={editPending}
                    onClick={() => void handleSaveEdit()}>
                    {editPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm whitespace-pre-wrap break-words">
                {bodyText}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={likePending}
                onClick={() => void handleToggleLike()}
                className="gap-1 text-xs text-muted-foreground hover:text-primary">
                <span>{liked ? "♥" : "♡"}</span>
                <span>{likesCount}</span>
              </Button>
              <ReactionPicker
                onSelect={handleSelectReaction}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={reactionPending}
                    className={cn(
                      "gap-2 text-muted-foreground",
                      userReaction ? "text-pink-600" : "hover:text-pink-600"
                    )}>
                    <span className="text-xs">{reactionCount}</span>
                  </Button>
                }
              />
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {(Object.keys(reactionCounts) as ReactionType[]).map((type) => {
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
                })}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <button
                type="button"
                className="hover:underline"
                onClick={() => setShowReplyComposer((v) => !v)}>
                Reply
              </button>
              {repliesCount > 0 && (
                <button
                  type="button"
                  className="hover:underline"
                  onClick={handleToggleRepliesOpen}>
                  {repliesOpen
                    ? "Hide replies"
                    : `View replies (${repliesCount})`}
                </button>
              )}
            </div>

            {showReplyComposer && (
              <div className="mt-3 ml-3 border-l pl-4">
                <CommentComposer
                  contentType={comment.contentType}
                  contentId={comment.contentId}
                  parentId={comment._id}
                  placeholder={`Reply to @${comment.author.username}...`}
                  autoFocus
                  onCreated={handleReplyCreated}
                />
              </div>
            )}

            {repliesOpen && (
              <div className="mt-3 ml-3 border-l pl-4 space-y-2">
                {replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    onDeleted={handleReplyDeleted}
                  />
                ))}
                {repliesHasMore && (
                  <div className="flex justify-start pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={repliesLoading}
                      onClick={() => void loadReplies(false)}>
                      {repliesLoading ? "Loading..." : "Load more replies"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
