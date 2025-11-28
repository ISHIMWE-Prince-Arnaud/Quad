import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostService } from "@/services/postService";
import toast from "react-hot-toast";
import type { Post } from "@/types/post";

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
        console.error("Error fetching post:", err);
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
      <PostCard post={post} onDelete={handleDelete} />

      {/* Comments section placeholder */}
      <div className="mt-6 p-6 border rounded-lg">
        <h3 className="font-semibold mb-2">Comments</h3>
        <p className="text-sm text-muted-foreground">
          Comments feature coming soon...
        </p>
      </div>
    </div>
  );
}
