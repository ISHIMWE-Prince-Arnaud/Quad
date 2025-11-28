import { z } from "zod";

// Media validation
const mediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video"]),
});

// ---------------------
// CREATE POST
// ---------------------
export const createPostSchema = z
  .object({
    text: z.string().max(1000).optional(),
    media: z.array(mediaSchema).optional(),
    // Note: author is set server-side from authenticated user
  })
  .refine((data) => data.text || (data.media && data.media.length > 0), {
    message: "Post must have either text or media",
    path: ["text"], // Show error on text field
  });

// ---------------------
// UPDATE POST
// ---------------------
export const updatePostSchema = z.object({
  text: z.string().max(1000).optional(),
  media: z
    .array(mediaSchema)
    .min(1, "At least one media is required")
    .optional(), // still optional on update
  // Note: author cannot be changed after post creation
});

// ---------------------
// GET / DELETE POST
// ---------------------
export const postIdSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
});

// ---------------------
// Types
// ---------------------
export type CreatePostSchemaType = z.infer<typeof createPostSchema>;
export type UpdatePostSchemaType = z.infer<typeof updatePostSchema>;
export type PostIdSchemaType = z.infer<typeof postIdSchema>;
