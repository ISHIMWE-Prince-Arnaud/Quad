import { useState, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { UploadService } from "@/services/uploadService";
import {
  createPostSchema,
  type CreatePostData,
  type MediaData,
} from "@/schemas/post.schema";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => void | Promise<void>;
  isLoading?: boolean;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export function CreatePostModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreatePostModalProps) {
  const { user } = useAuthStore();
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
    defaultValues: {
      text: "",
      media: [],
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setUploadedMedia([]);
      setUploadingFiles([]);
    }
  }, [open, form]);

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

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const totalFiles =
        uploadedMedia.length + uploadingFiles.length + fileArray.length;

      if (totalFiles > 10) {
        toast.error("You can only upload up to 10 files");
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validation = UploadService.validateFile(file, "any");
        if (!validation.valid) {
          toast.error(validation.error || "Invalid file");
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Create preview URLs and add to uploading state
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload files
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const uploadingIndex = uploadingFiles.length + i;

        try {
          // Update progress
          setUploadingFiles((prev) =>
            prev.map((uf, idx) =>
              idx === uploadingIndex ? { ...uf, progress: 50 } : uf
            )
          );

          const uploadResult = await UploadService.uploadPostMedia(file);

          // Detect aspect ratio for images
          let aspectRatio: "1:1" | "16:9" | "9:16" | undefined;
          if (file.type.startsWith("image/")) {
            const img = new Image();
            img.src = newUploadingFiles[i].preview;
            await new Promise((resolve) => {
              img.onload = () => {
                const ratio = img.width / img.height;
                if (Math.abs(ratio - 1) < 0.1) aspectRatio = "1:1";
                else if (Math.abs(ratio - 16 / 9) < 0.2) aspectRatio = "16:9";
                else if (Math.abs(ratio - 9 / 16) < 0.2) aspectRatio = "9:16";
                else aspectRatio = "1:1";
                resolve(null);
              };
            });
          }

          const newMedia: MediaData = {
            url: uploadResult.url,
            type: file.type.startsWith("video/") ? "video" : "image",
            aspectRatio,
          };

          setUploadedMedia((prev) => [...prev, newMedia]);
          setUploadingFiles((prev) =>
            prev.filter((_, idx) => idx !== uploadingIndex)
          );

          toast.success("Media uploaded successfully");
        } catch (error) {
          console.error("Upload error:", error);
          setUploadingFiles((prev) =>
            prev.map((uf, idx) =>
              idx === uploadingIndex ? { ...uf, error: "Upload failed" } : uf
            )
          );
          toast.error("Failed to upload media");
        }
      }
    },
    [uploadedMedia.length, uploadingFiles.length]
  );

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index];
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Create Post</DialogTitle>
              <DialogDescription>Share what's on your mind</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            {/* Text Input */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <AutoExpandingTextarea
                      placeholder="What's happening?"
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                      minHeight={120}
                      maxHeight={400}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between text-xs">
                    <FormMessage />
                    <span
                      className={cn(
                        "text-muted-foreground",
                        isOverLimit && "text-destructive font-medium"
                      )}>
                      {charCount}/1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Media Preview Grid */}
            <AnimatePresence mode="popLayout">
              {(uploadedMedia.length > 0 || uploadingFiles.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-3">
                  {/* Uploaded Media */}
                  {uploadedMedia.map((media, index) => (
                    <motion.div
                      key={`uploaded-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}>
                      <Card className="relative aspect-square overflow-hidden group">
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">
                              Video
                            </span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 rounded-full"
                          onClick={() => removeMedia(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Uploading Files */}
                  {uploadingFiles.map((file, index) => (
                    <motion.div
                      key={`uploading-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}>
                      <Card className="relative aspect-square overflow-hidden">
                        {file.file.type.startsWith("image/") ? (
                          <img
                            src={file.preview}
                            alt="Uploading..."
                            className="w-full h-full object-cover opacity-50"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center opacity-50">
                            <span className="text-sm text-muted-foreground">
                              Video
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          {file.error ? (
                            <div className="text-center p-4">
                              <p className="text-white text-xs mb-2">
                                {file.error}
                              </p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => removeUploadingFile(index)}>
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                              <p className="text-white text-xs">
                                {file.progress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Media Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "image/*,video/*";
                input.onchange = (e) =>
                  handleFileSelect((e.target as HTMLInputElement).files);
                input.click();
              }}>
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Add photos or videos</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {!hasContent && form.formState.isSubmitted && (
                  <span className="text-destructive">
                    Post must have text or media
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isOverLimit || !hasContent}
                  className="min-w-[100px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
