import { z } from "zod";

// Media validation
const mediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video"]),
});

// ---------------------
// CREATE POST
// ---------------------
export const createPostSchema = z.object({
  author: z.object({
    clerkId: z.string(),
    username: z.string(),
    email: z.string().email(),
    profileImage: z.string().url().optional(),
  }),
  text: z.string().max(1000).optional(),
  media: z.array(mediaSchema).min(1, "At least one media is required"), // REQUIRED
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
