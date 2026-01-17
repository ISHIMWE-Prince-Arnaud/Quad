import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CommentComposer } from "@/components/comments/CommentComposer";
import { CommentItem } from "@/components/comments/CommentItem";
import { CommentService } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import { ChevronDown } from "lucide-react";

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
  contentAuthorClerkId?: string;
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
  contentAuthorClerkId,
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
  const [total, setTotal] = useState<number | null>(null);

  const displayTotal = typeof total === "number" ? total : comments.length;

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
        if (typeof pag?.total === "number") {
          setTotal(pag.total);
        }
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
    setTotal(null);
    void loadComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId, initialPageSize]);

  const handleCommentCreated = async () => {
    await loadComments(true);
  };

  const handleCommentDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
    setTotal((t) => (typeof t === "number" ? Math.max(0, t - 1) : t));
  };

  return (
    <div className="rounded-3xl bg-[#0b1220] border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-semibold tracking-widest text-[#94a3b8] uppercase">
          Comments ({displayTotal})
        </h3>
      </div>

      <div className="mt-4">
        <CommentComposer
          contentType={contentType}
          contentId={contentId}
          placeholder="Add a comment..."
          onCreated={handleCommentCreated}
        />
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-4 divide-y divide-white/5">
        {comments.map((c) => (
          <div key={c._id} className="py-4">
            <CommentItem
              comment={c}
              contentAuthorClerkId={contentAuthorClerkId}
              onDeleted={handleCommentDeleted}
            />
          </div>
        ))}

        {comments.length === 0 && !loading && !error && (
          <div className="py-6">
            <p className="text-sm text-[#94a3b8]">Be the first to comment.</p>
          </div>
        )}

        {cursor.hasMore && (
          <div className="pt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void loadComments(false)}
              disabled={loading}
              className="text-[#94a3b8] hover:text-white">
              {loading ? "Loading..." : "Load more comments"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
