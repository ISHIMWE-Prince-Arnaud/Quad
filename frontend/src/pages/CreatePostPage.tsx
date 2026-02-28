import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePostForm } from "@/components/forms/CreatePostForm";
import { PostService } from "@/services/postService";
import type { CreatePostData } from "@/schemas/post.schema";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import { PiArrowLeftBold } from "react-icons/pi";
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
    <div className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="group inline-flex items-center gap-3 text-muted-foreground hover:text-foreground font-bold transition-all"
            onClick={() => navigate("/app/feed")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary group-hover:bg-accent transition-colors">
              <PiArrowLeftBold className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </div>
            <span className="text-xl tracking-tight">Create Post</span>
          </button>
        </div>

        <CreatePostForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
