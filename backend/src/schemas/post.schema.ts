import { z } from "zod";

// Media validation
const mediaSchema = z
  .object({
  url: z.string().url(),
  type: z.enum(["image", "video"]),
  aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
  })
  .strict();

// ---------------------
// CREATE POST
// ---------------------
/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePost:
 *       type: object
 *       required:
 *         - media
 *       properties:
 *         text:
 *           type: string
 *           maxLength: 1000
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *               aspectRatio:
 *                 type: string
 *                 enum: ["1:1", "16:9", "9:16"]
 */
export const createPostSchema = z
  .object({
    text: z.string().max(1000).optional(),
    media: z.array(mediaSchema).min(1, "At least one media is required"),
    // Note: author is set server-side from authenticated user
  })
  .strict();

// ---------------------
// UPDATE POST
// ---------------------
export const updatePostSchema = z
  .object({
    text: z.string().max(1000).optional(),
    media: z
      .array(mediaSchema)
      .min(1, "At least one media is required")
      .optional(), // still optional on update
    // Note: author cannot be changed after post creation
  })
  .strict();

// ---------------------
// GET / DELETE POST
// ---------------------
export const postIdSchema = z
  .object({
    id: z.string().min(1, "Post ID is required"),
  })
  .strict();

// ---------------------
// Types
// ---------------------
export type CreatePostSchemaType = z.infer<typeof createPostSchema>;
export type UpdatePostSchemaType = z.infer<typeof updatePostSchema>;
export type PostIdSchemaType = z.infer<typeof postIdSchema>;

// ---------------------
// GET ALL POSTS QUERY
// ---------------------
export const getPostsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  skip: z.coerce.number().min(0).default(0),
});

export type GetPostsQuerySchemaType = z.infer<typeof getPostsQuerySchema>;
