import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePostForm } from "@/components/forms/CreatePostForm";
import { PostService } from "@/services/postService";
import type { CreatePostData } from "@/schemas/post.schema";
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

  return "An error occurred while creating the post";
}

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CreatePostData) => {
    setIsSubmitting(true);

    try {
      const response = await PostService.createPost(data);

      if (response.success) {
        toast.success("Post created successfully!");
        // Navigate to feed after successful post creation
        navigate("/app/feed");
      } else {
        toast.error(response.message || "Failed to create post");
      }
    } catch (error: unknown) {
      logError(error, { component: "CreatePostPage", action: "createPost" });
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create a Post</h1>
        <p className="text-muted-foreground mt-2">
          Share your thoughts, photos, or videos with the community
        </p>
      </div>

      <CreatePostForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
