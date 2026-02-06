import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Image, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

import { MediaPreviewGrid } from "@/components/forms/create-post-modal/MediaPreviewGrid";
import { MediaUploadDropzone } from "@/components/forms/create-post-modal/MediaUploadDropzone";
import { useCreatePostMedia } from "@/components/forms/create-post-modal/useCreatePostMedia";

import type { CreatePostData } from "@/schemas/post.schema";

export function FeedPostComposer({
  onCreatePost,
  disabled = false,
}: {
  onCreatePost: (payload: {
    text?: string;
    media: CreatePostData["media"];
  }) => Promise<void>;
  disabled?: boolean;
}) {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openFilePicker = (accept: string) => {
    if (disabled) return;
    setIsExpanded(true);

    const input = fileInputRef.current;
    if (!input) return;

    input.accept = accept;
    input.click();
  };

  const {
    uploadedMedia,
    uploadingFiles,
    isDragging,
    resetMediaState,
    handleFileSelect,
    removeMedia,
    removeUploadingFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  } = useCreatePostMedia();

  const trimmedText = text.trim();
  const hasMedia = uploadedMedia.length > 0;
  const canSubmit = hasMedia && uploadingFiles.length === 0 && !disabled;

  useEffect(() => {
    if (!disabled && isExpanded) {
      inputRef.current?.focus();
    }
  }, [disabled, isExpanded]);

  const resetComposer = () => {
    setText("");
    resetMediaState();
    setIsExpanded(false);
  };

  const submit = async () => {
    if (disabled || isSubmitting) return;

    if (!hasMedia) {
      toast.error("Post must have at least one media");
      setIsExpanded(true);
      inputRef.current?.focus();
      return;
    }

    if (uploadingFiles.length > 0) {
      toast.error("Please wait for uploads to finish");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreatePost({
        ...(trimmedText.length > 0 ? { text: trimmedText } : {}),
        media: uploadedMedia,
      });
      resetComposer();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-border/40 rounded-[2rem] p-4 shadow-card transition-all hover:border-border/60",
        disabled && "opacity-60",
      )}
      onClick={() => {
        if (!disabled) setIsExpanded(true);
      }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          void handleFileSelect(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-border/40">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            rows={1}
            disabled={disabled || isSubmitting}
            onFocus={() => {
              if (!disabled) setIsExpanded(true);
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
            className="
              w-full
              bg-transparent
              border-none
              outline-none
              ring-0
              ring-offset-0
              focus:outline-none
              focus:ring-0
              focus:ring-offset-0
              focus-visible:outline-none
              focus-visible:ring-0
              focus-visible:ring-offset-0
              active:outline-none
              active:ring-0
              active:ring-offset-0
              text-foreground
              placeholder:text-muted-foreground
              text-lg
              resize-none
              min-h-[48px]
              py-2
            "
          />

          {isExpanded && (
            <div className="space-y-3">
              <MediaPreviewGrid
                uploadedMedia={uploadedMedia}
                uploadingFiles={uploadingFiles}
                onRemoveMedia={removeMedia}
                onRemoveUploadingFile={removeUploadingFile}
              />

              <MediaUploadDropzone
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onSelectFiles={handleFileSelect}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  openFilePicker("image/*");
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
                aria-label="Add image"
                title="Add image">
                <Image className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  openFilePicker("video/*");
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
                aria-label="Add video"
                title="Add video">
                <Video className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isExpanded && (
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  disabled={disabled || isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    resetComposer();
                  }}>
                  Cancel
                </Button>
              )}

              <Button
                type="button"
                className={cn(
                  "rounded-full px-8 font-bold transition-all shadow-lg active:scale-95",
                  canSubmit
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground scale-100 shadow-primary/20"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed shadow-none",
                )}
                disabled={!canSubmit || isSubmitting}
                onClick={(e) => {
                  e.stopPropagation();
                  void submit();
                }}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </span>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
