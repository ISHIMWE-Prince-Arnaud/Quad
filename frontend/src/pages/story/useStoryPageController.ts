import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { ReactionService, type ReactionType } from "@/services/reactionService";
import { StoryService } from "@/services/storyService";
import type { Story } from "@/types/story";
import { logError } from "@/lib/errorHandling";

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
  const [totalReactions, setTotalReactions] = useState(0);

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
          setTotalReactions(res.data.totalCount ?? 0);
          setUserReaction(res.data.userReaction?.type ?? null);
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

      const prevTotal = totalReactions;
      const wasReacted = prevType === type;
      const nextTotal = wasReacted ? Math.max(0, prevTotal - 1) : prevTotal + 1;
      setUserReaction(wasReacted ? null : type);
      setTotalReactions(nextTotal);

      try {
        const res = await ReactionService.toggle("story", id, type);
        if (!res.success) throw new Error(res.message || "Failed to update reaction");

        if (typeof res.reactionCount === "number") {
          setTotalReactions(res.reactionCount);
        }
        if (res.data === null) {
          setUserReaction(null);
        } else if (res.data) {
          setUserReaction(res.data.type);
        }
      } catch (err) {
        logError(err, {
          component: "StoryPage",
          action: "toggleReaction",
          metadata: { id, reactionType: type },
        });
        toast.error("Failed to update reaction");
        setUserReaction(prevType);
        setTotalReactions(prevTotal);
      }
    },
    [id, totalReactions, userReaction]
  );

  return {
    story,
    loading,
    error,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleting,
    userReaction,
    totalReactions,
    readingTime,
    handleShare,
    handleDelete,
    handleEdit,
    handleSelectReaction,
  };
}
