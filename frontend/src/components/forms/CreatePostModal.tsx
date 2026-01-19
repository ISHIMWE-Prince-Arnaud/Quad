import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { useAuthStore } from "@/stores/authStore";
import {
  createPostSchema,
  type CreatePostData,
} from "@/schemas/post.schema";

import { CreatePostActions } from "./create-post-modal/CreatePostActions";
import { CreatePostModalHeader } from "./create-post-modal/CreatePostModalHeader";
import { CreatePostTextField } from "./create-post-modal/CreatePostTextField";
import { MediaPreviewGrid } from "./create-post-modal/MediaPreviewGrid";
import { MediaUploadDropzone } from "./create-post-modal/MediaUploadDropzone";
import { useCreatePostMedia } from "./create-post-modal/useCreatePostMedia";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => void | Promise<void>;
  isLoading?: boolean;
}

export function CreatePostModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreatePostModalProps) {
  const { user } = useAuthStore();
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

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
    defaultValues: {
      text: "",
      media: [],
    },
  });

  const resetFormState = useCallback(() => {
    form.reset();
    resetMediaState();
  }, [form, resetMediaState]);

  // Reset form when modal closes (effect cleanup avoids synchronous state updates in body)
  useEffect(() => {
    if (!open) return;

    return () => {
      resetFormState();
    };
  }, [open, resetFormState]);

  const textValue =
    useWatch({ control: form.control, name: "text", defaultValue: "" }) || "";
  const charCount = textValue.length;
  const isOverLimit = charCount > 1000;
  const hasMedia = uploadedMedia.length > 0;

  const handleSubmit = async (data: CreatePostData) => {
    const submitData: CreatePostData = {
      ...(typeof data.text === "string" && data.text.trim().length > 0
        ? { text: data.text }
        : {}),
      media: uploadedMedia,
    };

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showClose={false}
        className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/5 bg-[#0b1220] p-6">
        <DialogDescription className="sr-only">
          Create a new post and attach at least one media.
        </DialogDescription>
        <CreatePostModalHeader user={user} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6">
            {/* Text Input */}
            <CreatePostTextField
              control={form.control}
              isLoading={isLoading}
              charCount={charCount}
              isOverLimit={isOverLimit}
            />

            {/* Media Preview Grid */}
            <MediaPreviewGrid
              uploadedMedia={uploadedMedia}
              uploadingFiles={uploadingFiles}
              onRemoveMedia={removeMedia}
              onRemoveUploadingFile={removeUploadingFile}
            />

            {/* Media Upload Area */}
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-white">Add Media</p>
                <p className="text-xs text-[#94a3b8]">
                  Upload up to 10 images or videos. JPG, PNG, GIF, MP4
                </p>
              </div>
            <MediaUploadDropzone
              isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onSelectFiles={handleFileSelect}
            />
            </div>

            {/* Action Buttons */}
            <CreatePostActions
              hasContent={hasMedia}
              isSubmitted={form.formState.isSubmitted}
              isLoading={isLoading}
              isOverLimit={isOverLimit}
              onCancel={onClose}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
