import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostService } from "@/services/postService";
import toast from "react-hot-toast";
import type { Post } from "@/types/post";
import { CommentService } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import { CommentComposer } from "@/components/comments/CommentComposer";
import { CommentItem } from "@/components/comments/CommentItem";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load post";
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsCursor, setCommentsCursor] = useState<{
    skip: number;
    limit: number;
    hasMore: boolean;
  }>({ skip: 0, limit: 20, hasMore: true });

  useEffect(() => {
    if (!id) {
      setError("Post ID is required");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await PostService.getPostById(id);
        if (response.success) {
          setPost(response.data);
        } else {
          setError(response.message || "Failed to load post");
        }
      } catch (err: unknown) {
        console.error("Error fetching post:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Reset and load initial comments
    setComments([]);
    setCommentsCursor({ skip: 0, limit: 20, hasMore: true });
    void loadMoreComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMoreComments = async (reset = false) => {
    if (!id || commentsLoading) return;
    if (!reset && !commentsCursor.hasMore) return;

    try {
      setCommentsLoading(true);
      const nextSkip = reset ? 0 : commentsCursor.skip;
      const res = await CommentService.getByContent("post", id, {
        limit: commentsCursor.limit,
        skip: nextSkip,
        parentId: null,
      });
      if (res.success) {
        const data = res.data || [];
        setComments((prev) => (reset ? data : [...prev, ...data]));
        const pag = res.pagination;
        setCommentsCursor({
          skip: nextSkip + data.length,
          limit: commentsCursor.limit,
          hasMore: Boolean(pag?.hasMore),
        });
      }
    } catch {
      // soft fail
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentCreated = async () => {
    // Reload comments from start to show the new one at top
    await loadMoreComments(true);
  };

  const handleDelete = async (deletedPostId: string) => {
    try {
      const response = await PostService.deletePost(deletedPostId);
      if (response.success) {
        toast.success("Post deleted successfully");
        navigate("/app/feed");
      } else {
        toast.error(response.message || "Failed to delete post");
      }
    } catch (err: unknown) {
      console.error("Error deleting post:", err);
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The post you are looking for does not exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/app/feed">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Post card */}
      <PostCard post={post} onDelete={handleDelete} isSingleView />

      {/* Comments section */}
      <div className="mt-6 p-6 border rounded-lg space-y-4">
        <h3 className="font-semibold">Comments</h3>
        <CommentComposer
          contentType="post"
          contentId={post._id}
          onCreated={handleCommentCreated}
        />
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} />
          ))}
          {comments.length === 0 && !commentsLoading && (
            <p className="text-sm text-muted-foreground">
              Be the first to comment.
            </p>
          )}
          {commentsCursor.hasMore && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMoreComments()}
                disabled={commentsLoading}>
                {commentsLoading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
