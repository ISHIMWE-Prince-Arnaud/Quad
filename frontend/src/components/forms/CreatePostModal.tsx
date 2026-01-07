import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
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
  const hasContent = textValue.trim().length > 0 || uploadedMedia.length > 0;

  const handleSubmit = async (data: CreatePostData) => {
    const submitData: CreatePostData = {
      text: data.text || undefined,
      media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
    };

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CreatePostModalHeader user={user} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
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
            <MediaUploadDropzone
              isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onSelectFiles={handleFileSelect}
            />

            {/* Action Buttons */}
            <CreatePostActions
              hasContent={hasContent}
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
