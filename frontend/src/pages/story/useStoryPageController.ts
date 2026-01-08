import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService, type ReactionType } from "@/services/reactionService";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { logError } from "@/lib/errorHandling";

import { EMPTY_REACTION_COUNTS } from "./constants";
import { getErrorMessage } from "./getErrorMessage";

export function useStoryPageController({
  id,
  onNavigate,
}: {
  id?: string;
  onNavigate: (path: string) => void;
}) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    ...EMPTY_REACTION_COUNTS,
  });

  const totalReactions = useMemo(() => {
    return (Object.values(reactionCounts) as number[]).reduce((a, b) => a + b, 0);
  }, [reactionCounts]);

  const readingTime = useMemo(() => {
    if (!story?.content) return 0;
    if (story.readTime) return story.readTime;
    const text = story.content.replace(/<[^>]*>/g, "");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [story]);

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
        logError(err, { component: "StoryPage", action: "loadStory", metadata: { id } });
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
          const next: Record<ReactionType, number> = { ...EMPTY_REACTION_COUNTS };
          for (const rc of res.data.reactionCounts) {
            next[rc.type] = rc.count;
          }
          setReactionCounts(next);
          setUserReaction((res.data.userReaction?.type as ReactionType) || null);
        }
      } catch (err) {
        logError(err, {
          component: "StoryPage",
          action: "loadReactions",
          metadata: { id },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShare = useCallback(async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: story?.title ?? "Story", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      logError(err, { component: "StoryPage", action: "shareStory", metadata: { id } });
    }
  }, [story?.title, id]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    try {
      setDeleting(true);
      const res = await StoryService.delete(id);
      if (res.success) {
        toast.success("Story deleted successfully");
        onNavigate("/app/stories");
      } else {
        toast.error(res.message || "Failed to delete story");
      }
    } catch (err) {
      logError(err, { component: "StoryPage", action: "deleteStory", metadata: { id } });
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [id, onNavigate]);

  const handleEdit = useCallback(() => {
    if (!id) return;
    onNavigate(`/app/stories/${id}/edit`);
  }, [id, onNavigate]);

  const handleSelectReaction = useCallback(
    async (type: ReactionType) => {
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
        logError(err, {
          component: "StoryPage",
          action: "toggleReaction",
          metadata: { id, reactionType: type },
        });
        toast.error("Failed to update reaction");
        setReactionCounts(prevCounts);
        setUserReaction(prevType);
      }
    },
    [id, reactionCounts, userReaction]
  );

  return {
    story,
    loading,
    error,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleting,
    userReaction,
    reactionCounts,
    totalReactions,
    readingTime,
    handleShare,
    handleDelete,
    handleEdit,
    handleSelectReaction,
  };
}
