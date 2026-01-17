import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/components/comments/CommentComposer";
import { CommentItem } from "@/components/comments/CommentItem";
import { CommentService } from "@/services/commentService";
import type { Comment } from "@/types/comment";

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
  return "Failed to load comments";
}

export type CommentSort = "newest" | "oldest" | "mostLiked";

interface CommentsSectionProps {
  contentType: "post" | "story" | "poll";
  contentId: string;
  initialPageSize?: number;
}

interface CommentsCursor {
  skip: number;
  limit: number;
  hasMore: boolean;
}

export function CommentsSection({
  contentType,
  contentId,
  initialPageSize = 20,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<CommentsCursor>({
    skip: 0,
    limit: initialPageSize,
    hasMore: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<CommentSort>("newest");

  const sortedComments = useMemo(() => {
    const copy = [...comments];
    switch (sort) {
      case "oldest":
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "mostLiked":
        return copy.sort((a, b) => b.likesCount - a.likesCount);
      case "newest":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [comments, sort]);

  const loadComments = async (reset = false) => {
    if (loading) return;
    if (!reset && !cursor.hasMore) return;

    try {
      setLoading(true);
      setError(null);
      const nextSkip = reset ? 0 : cursor.skip;
      const res = await CommentService.getByContent(contentType, contentId, {
        limit: cursor.limit,
        skip: nextSkip,
      });
      if (res.success) {
        const data = res.data || [];
        setComments((prev) => (reset ? data : [...prev, ...data]));
        const pag = res.pagination;
        setCursor({
          skip: nextSkip + data.length,
          limit: cursor.limit,
          hasMore: Boolean(pag?.hasMore),
        });
      } else if (res.message) {
        setError(res.message);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset when content changes
    setComments([]);
    setCursor({ skip: 0, limit: initialPageSize, hasMore: true });
    void loadComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId, initialPageSize]);

  const handleCommentCreated = async () => {
    await loadComments(true);
  };

  const handleCommentDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">
          Comments <span className="text-muted-foreground ml-1">({comments.length})</span>
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sort by:</span>
          <select
            className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            value={sort}
            onChange={(e) => setSort(e.target.value as CommentSort)}>
            <option value="mostLiked">Top</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <CommentComposer
        contentType={contentType}
        contentId={contentId}
        onCreated={handleCommentCreated}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-6">
        {sortedComments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            onDeleted={handleCommentDeleted}
          />
        ))}
        {sortedComments.length === 0 && !loading && !error && (
          <p className="text-muted-foreground">
            Be the first to comment.
          </p>
        )}
        {cursor.hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadComments(false)}
              disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
