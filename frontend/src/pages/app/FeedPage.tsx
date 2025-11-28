import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { PostService } from "@/services/postService";
import { useAuthStore } from "@/stores/authStore";
import { ComponentErrorBoundary } from "@/components/ui/error-boundary";
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

  return "Something went wrong";
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await PostService.getAllPosts({ limit: 20, skip: 0 });
        if (response.success) {
          setPosts(response.data);
        } else {
          setError(response.message || "Failed to load posts");
        }
      } catch (err: unknown) {
        console.error("Error fetching posts:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    try {
      const response = await PostService.deletePost(postId);
      if (response.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete post");
      }
    } catch (err: unknown) {
      console.error("Error deleting post:", err);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <ComponentErrorBoundary>
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Create Post Card */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.firstName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-muted-foreground"
                asChild>
                <Link to="/app/create">What's on your mind?</Link>
              </Button>
              <Button size="icon" className="shrink-0" asChild>
                <Link to="/app/create">
                  <Plus className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="pt-6 text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something!
              </p>
              <Button asChild>
                <Link to="/app/create">Create Post</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts list */}
        {!loading && !error && posts.length > 0 && (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))}
          </>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}
