import { z } from "zod";

/**
 * Comment creation schema aligned with backend POST /api/comments
 * Validates comment text and metadata
 */
export const createCommentSchema = z.object({
  contentType: z.enum(["post", "story", "poll"], {
    message: "Content type must be post, story, or poll",
  }),
  contentId: z.string().min(1, "Content ID is required"),
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(2000, "Comment must be less than 2000 characters")
    .trim()
    .refine(
      (val) => {
        // Ensure comment has meaningful content (not just whitespace)
        return val.trim().length > 0;
      },
      {
        message: "Comment cannot be empty",
      }
    ),
  parentId: z.string().optional(),
});

/**
 * Comment update schema aligned with backend PATCH /api/comments/:id
 */
export const updateCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(2000, "Comment must be less than 2000 characters")
    .trim()
    .refine(
      (val) => {
        return val.trim().length > 0;
      },
      {
        message: "Comment cannot be empty",
      }
    ),
});

export type CreateCommentData = z.infer<typeof createCommentSchema>;
export type UpdateCommentData = z.infer<typeof updateCommentSchema>;
