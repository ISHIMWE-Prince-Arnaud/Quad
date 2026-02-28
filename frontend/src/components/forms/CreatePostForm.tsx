import { useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MediaUploader } from "./MediaUploader";
import {
  createPostSchema,
  type CreatePostData,
  type MediaData,
} from "@/schemas/post.schema";

interface CreatePostFormProps {
  onSubmit?: (data: CreatePostData) => void | Promise<void>;
  isLoading?: boolean;
  initialValues?: Partial<CreatePostData>;
}

export function CreatePostForm({
  onSubmit,
  isLoading = false,
  initialValues,
}: CreatePostFormProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>(
    initialValues?.media ?? [],
  );

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange", // Validate on change to clear errors immediately
    defaultValues: {
      text: initialValues?.text ?? "",
      media: initialValues?.media ?? [],
    },
  });

  const handleSubmit = async (data: CreatePostData) => {
    // Include uploaded media in submission
    const submitData: CreatePostData = {
      ...(typeof data.text === "string" && data.text.trim().length > 0
        ? { text: data.text }
        : {}),
      media: uploadedMedia,
    };

    await onSubmit?.(submitData);
  };

  // Memoize callback to prevent unnecessary re-renders in MediaUploader
  const handleMediaChange = useCallback(
    (media: MediaData[]) => {
      setUploadedMedia(media);
      form.setValue("media", media, { shouldValidate: true });
    },
    [form],
  );

  const textValue =
    useWatch({ control: form.control, name: "text", defaultValue: "" }) || "";
  const charCount = textValue.length;
  const isOverLimit = charCount > 1000;
  const hasMedia = uploadedMedia.length > 0;

  return (
    <div className="w-full mx-auto">
      <div className="rounded-[2rem] border border-border/40 bg-card p-6 shadow-sm mb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6">
            {/* Post Content */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="post-text">What's happening?</FormLabel>
                  <FormControl>
                    <Textarea
                      id="post-text"
                      placeholder="Share your thoughts..."
                      className="min-h-[120px] resize-none"
                      disabled={isLoading}
                      aria-describedby="post-text-description post-text-error"
                      aria-invalid={!!form.formState.errors.text}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription
                    id="post-text-description"
                    className={isOverLimit ? "text-destructive" : ""}
                    role={isOverLimit ? "alert" : undefined}>
                    {charCount}/1000 characters
                    {isOverLimit && " - Character limit exceeded"}
                  </FormDescription>
                  <FormMessage id="post-text-error" />
                </FormItem>
              )}
            />

            {/* Media Upload */}
            <div>
              <FormLabel htmlFor="media-upload">Add Media</FormLabel>
              <p
                className="text-xs text-muted-foreground mb-2"
                id="media-upload-description">
                Upload up to 10 images or videos. Supported formats: JPG, PNG,
                GIF, MP4
              </p>
              <MediaUploader
                onMediaChange={handleMediaChange}
                maxFiles={10}
                initialMedia={initialValues?.media}
                className="mt-2"
                aria-describedby="media-upload-description"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <div className="text-sm mb-2 text-center h-5">
                {!hasMedia && form.formState.isSubmitted && (
                  <span className="text-destructive font-semibold">
                    Post must have at least one valid text/media
                  </span>
                )}
              </div>
              <Button
                type="submit"
                disabled={
                  isLoading || isOverLimit || (!hasMedia && !textValue.trim())
                }
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
