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
  onCreatePost: (payload: { text: string; media?: CreatePostData["media"] }) => Promise<void>;
  disabled?: boolean;
}) {
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const hasText = text.trim().length > 0;
  const canSubmit = hasText && uploadingFiles.length === 0 && !disabled;

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

    if (!hasText) {
      toast.error("Post text is required");
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
        text: text.trim(),
        media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
      });
      resetComposer();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-[#0f121a] border border-white/5 rounded-[2rem] p-4 shadow-xl transition-all hover:border-white/10",
        disabled && "opacity-60"
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
        <Avatar className="h-12 w-12 border-2 border-white/5">
          <AvatarImage src={user?.profileImage} />
          <AvatarFallback className="bg-[#1e293b] text-white">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-[#64748b] text-lg resize-none min-h-[48px] py-2"
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

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (disabled) return;
                  setIsExpanded(true);
                  fileInputRef.current?.click();
                }}
                className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all"
                aria-label="Add media"
                title="Add media">
                <Image className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (disabled) return;
                  setIsExpanded(true);
                  fileInputRef.current?.click();
                }}
                className="p-2 text-[#64748b] hover:text-white hover:bg-white/5 rounded-xl transition-all"
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
                  "rounded-full px-8 font-bold transition-all shadow-lg",
                  canSubmit
                    ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white scale-100"
                    : "bg-[#2563eb]/20 text-white/20 cursor-not-allowed"
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
