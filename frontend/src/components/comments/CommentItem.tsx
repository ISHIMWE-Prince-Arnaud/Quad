import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { ReactionService } from "@/services/reactionService";
import type { ReactionType } from "@/services/reactionService";
import toast from "react-hot-toast";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
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
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold truncate max-w-[160px]">
                {comment.author.username}
              </span>
              <span className="text-muted-foreground">
                · {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap break-words">
              {comment.text}
            </p>

            <div className="mt-2 flex items-center gap-2">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
