import { z } from "zod";

// Valid content types that can receive comments
export const commentableContentTypes = ["post", "story", "poll"] as const;

// ---------------------
// CREATE COMMENT
// ---------------------
export const createCommentSchema = z.object({
  contentType: z.enum(commentableContentTypes, {
    message: "Invalid content type"
  }),
  contentId: z.string().min(1, "Content ID is required"),
  text: z.string()
    .min(1, "Comment text is required")
    .max(2000, "Comment cannot exceed 2000 characters"),
  parentId: z.string().optional(), // For replies
});

// ---------------------
// UPDATE COMMENT
// ---------------------
export const updateCommentSchema = z.object({
  text: z.string()
    .min(1, "Comment text is required")
    .max(2000, "Comment cannot exceed 2000 characters"),
});

// ---------------------
// GET COMMENTS BY CONTENT
// ---------------------
export const getCommentsByContentSchema = z.object({
  contentType: z.enum(commentableContentTypes),
  contentId: z.string().min(1, "Content ID is required"),
  limit: z.string().optional(),
  skip: z.string().optional(),
  parentId: z.string().optional(), // For fetching replies
});

// ---------------------
// COMMENT ID PARAM
// ---------------------
export const commentIdSchema = z.object({
  id: z.string().min(1, "Comment ID is required"),
});

// ---------------------
// LIKE/UNLIKE COMMENT
// ---------------------
export const toggleCommentLikeSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
});

// ---------------------
// Types
// ---------------------
export type CreateCommentSchemaType = z.infer<typeof createCommentSchema>;
export type UpdateCommentSchemaType = z.infer<typeof updateCommentSchema>;
export type GetCommentsByContentSchemaType = z.infer<typeof getCommentsByContentSchema>;
export type CommentIdSchemaType = z.infer<typeof commentIdSchema>;
export type ToggleCommentLikeSchemaType = z.infer<typeof toggleCommentLikeSchema>;
