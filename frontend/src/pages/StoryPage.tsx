import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Share2 } from "lucide-react";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { ReactionPicker } from "@/components/reactions/ReactionPicker";
import { ReactionService, type ReactionType } from "@/services/reactionService";
import toast from "react-hot-toast";

const reactionEmojiMap: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
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
  const totalReactions = useMemo(
    () =>
      (Object.values(reactionCounts) as number[]).reduce((a, b) => a + b, 0),
    [reactionCounts]
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await StoryService.getById(id);
        if (!cancelled && res.success && res.data) {
          setStory(res.data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await ReactionService.getByContent("story", id);
        if (!cancelled && res.success && res.data) {
          const next: Record<ReactionType, number> = {
            like: 0,
            love: 0,
            laugh: 0,
            wow: 0,
            sad: 0,
            angry: 0,
          };
          for (const rc of res.data.reactionCounts) {
            next[rc.type] = rc.count;
          }
          setReactionCounts(next);
          setUserReaction(
            (res.data.userReaction?.type as ReactionType) || null
          );
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: story?.title ?? "Story", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReaction = async (type: ReactionType) => {
    if (!id) return;
    const prevType = userReaction;
    const prevCounts = { ...reactionCounts };

    const nextCounts: Record<ReactionType, number> = { ...prevCounts };
    if (prevType === type) {
      nextCounts[type] = Math.max(0, (nextCounts[type] ?? 0) - 1);
      setUserReaction(null);
    } else {
      if (prevType) {
        nextCounts[prevType] = Math.max(0, (nextCounts[prevType] ?? 0) - 1);
      }
      nextCounts[type] = (nextCounts[type] ?? 0) + 1;
      setUserReaction(type);
    }
    setReactionCounts(nextCounts);

    try {
      if (prevType === type) {
        const res = await ReactionService.remove("story", id);
        if (!res.success) throw new Error(res.message || "Failed to remove");
      } else {
        const res = await ReactionService.toggle("story", id, type);
        if (!res.success) throw new Error(res.message || "Failed to react");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reaction");
      setReactionCounts(prevCounts);
      setUserReaction(prevType);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading story...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{story.title}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleShare()}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {story.coverImage && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}

        <Card>
          <CardContent className="prose prose-invert max-w-none p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>By {story.author.username}</span>
              {typeof story.readTime === "number" && (
                <span>{story.readTime} min read</span>
              )}
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>

            <div dangerouslySetInnerHTML={{ __html: story.content }} />

            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2">
                <ReactionPicker
                  onSelect={(type) => void handleSelectReaction(type)}
                  trigger={
                    <Button
                      variant={userReaction ? "secondary" : "outline"}
                      size="sm">
                      {userReaction
                        ? `Reacted ${reactionEmojiMap[userReaction]}`
                        : "React"}
                    </Button>
                  }
                />
                <div className="text-sm text-muted-foreground">
                  {totalReactions} reactions
                </div>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
