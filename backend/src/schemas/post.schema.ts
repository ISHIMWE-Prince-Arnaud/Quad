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
  media: z.array(mediaSchema).optional(),
});

// ---------------------
// UPDATE POST
// ---------------------
export const updatePostSchema = createPostSchema.partial();

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
