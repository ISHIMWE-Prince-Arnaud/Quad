import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePostForm } from "@/components/forms/CreatePostForm";
import { PostService } from "@/services/postService";
import type { CreatePostData } from "@/schemas/post.schema";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import { logError } from "@/lib/errorHandling";

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CreatePostData) => {
    setIsSubmitting(true);

    try {
      const response = await PostService.createPost(data);

      if (response.success) {
        showSuccessToast("Post created");
        // Navigate to feed after successful post creation
        navigate("/app/feed");
      } else {
        showErrorToast(response.message || "Failed to create post");
      }
    } catch (error: unknown) {
      logError(error, { component: "CreatePostPage", action: "createPost" });
      showErrorToast(error);
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
