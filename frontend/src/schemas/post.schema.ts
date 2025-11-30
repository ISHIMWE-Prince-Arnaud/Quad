import { z } from "zod";

/**
 * Media schema matching backend requirements
 * Supports both images and videos with aspect ratio options
 */
export const mediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: z.enum(["image", "video"], {
    message: "Media type must be either image or video",
  }),
  aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
});

/**
 * Post creation schema aligned with backend POST /api/posts
 * Either text or media must be provided (or both)
 */
export const createPostSchema = z
  .object({
    text: z
      .union([
        z.string().max(1000, "Post text cannot exceed 1000 characters"),
        z.literal(""),
      ])
      .optional(),
    media: z
      .array(mediaSchema)
      .max(10, "Cannot upload more than 10 media items")
      .optional(),
  })
  .refine(
    (data) => {
      // Check that at least one content type is present with meaningful content
      const hasText = data.text && data.text.trim().length > 0;
      const hasMedia = data.media && data.media.length > 0;
      return hasText || hasMedia;
    },
    {
      message: "Post must have text or media",
      path: ["text"],
    }
  );

export type CreatePostData = z.infer<typeof createPostSchema>;
export type MediaData = z.infer<typeof mediaSchema>;
