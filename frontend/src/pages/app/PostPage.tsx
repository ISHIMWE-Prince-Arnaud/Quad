import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PiArrowLeftBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostService } from "@/services/postService";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import type { Post } from "@/types/post";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { logError } from "@/lib/errorHandling";
import { SkeletonPost, CommentsSkeleton } from "@/components/ui/loading";

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
        logError(err, {
          component: "PostPage",
          action: "fetchPost",
          metadata: { id },
        });
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async (deletedPostId: string) => {
    try {
      const response = await PostService.deletePost(deletedPostId);
      if (response.success) {
        showSuccessToast("Post deleted");
        navigate("/app/feed");
      } else {
        showErrorToast(response.message || "Failed to delete post");
      }
    } catch (err: unknown) {
      logError(err, {
        component: "PostPage",
        action: "deletePost",
        metadata: { postId: deletedPostId },
      });
      showErrorToast(err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 hover:bg-secondary"
          onClick={() => navigate(-1)}>
          <PiArrowLeftBold className="h-4 w-4 mr-2" />
          Back
        </Button>

        <SkeletonPost />
        <CommentsSkeleton />
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
              <PiArrowLeftBold className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all group"
        onClick={() => navigate(-1)}>
        <PiArrowLeftBold className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>

      {/* Post card */}
      <PostCard post={post} onDelete={handleDelete} isSingleView />

      <CommentsSection
        contentType="post"
        contentId={post._id}
        contentAuthorClerkId={post.author.clerkId}
      />
    </div>
  );
}
