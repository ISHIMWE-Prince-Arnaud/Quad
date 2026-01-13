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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MediaUploader } from "./MediaUploader";
import { useAuthStore } from "@/stores/authStore";
import {
  createPostSchema,
  type CreatePostData,
  type MediaData,
} from "@/schemas/post.schema";

interface CreatePostFormProps {
  onSubmit?: (data: CreatePostData) => void | Promise<void>;
  isLoading?: boolean;
  initialValues?: Partial<CreatePostData>;
  onCancel?: () => void;
}

export function CreatePostForm({
  onSubmit,
  isLoading = false,
  initialValues,
  onCancel,
}: CreatePostFormProps) {
  const { user } = useAuthStore();
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>(
    initialValues?.media ?? []
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
    [form]
  );

  const textValue =
    useWatch({ control: form.control, name: "text", defaultValue: "" }) || "";
  const charCount = textValue.length;
  const isOverLimit = charCount > 1000;
  const hasMedia = uploadedMedia.length > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">Create Post</h3>
            <p className="text-sm text-muted-foreground">
              Share what's on your mind
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
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
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm">
                {!hasMedia && form.formState.isSubmitted && (
                  <span className="text-destructive">
                    Post must have at least one media
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (onCancel) {
                      onCancel();
                    } else {
                      form.reset();
                      setUploadedMedia(initialValues?.media ?? []);
                    }
                  }}
                  disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isOverLimit || !hasMedia}
                  className="min-w-[100px]">
                  {isLoading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
