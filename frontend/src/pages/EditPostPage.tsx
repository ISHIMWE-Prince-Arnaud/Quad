import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { CreatePostForm } from "@/components/forms/CreatePostForm";
import { PostService } from "@/services/postService";
import type { CreatePostData } from "@/schemas/post.schema";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";
import { logError } from "@/lib/errorHandling";

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: { message?: string };
        };
      }
    ).response;

    const apiMessage = response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An error occurred while updating the post";
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          component: "EditPostPage",
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

  const handleSubmit = async (data: CreatePostData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const response = await PostService.updatePost(id, data);

      if (response.success) {
        toast.success("Post updated successfully!");
        navigate(`/app/posts/${id}`);
      } else {
        toast.error(response.message || "Failed to update post");
      }
    } catch (err: unknown) {
      logError(err, {
        component: "EditPostPage",
        action: "updatePost",
        metadata: { id },
      });
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Unable to edit post</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "The post you are trying to edit does not exist or cannot be loaded."}
          </p>
          <Button onClick={() => navigate("/app/feed")}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  const initialValues: CreatePostData = {
    text: post.text ?? "",
    media: (post.media ?? []).map((m) => ({
      url: m.url,
      type: m.type,
      ...(m.aspectRatio ? { aspectRatio: m.aspectRatio } : {}),
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Post</h1>
        </div>
      </div>

      <CreatePostForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        initialValues={initialValues}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
