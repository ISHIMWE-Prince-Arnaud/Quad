import { z } from "zod";

/**
 * Story creation schema aligned with backend POST /api/stories
 * Validates title, content, and optional fields
 */
export const createStorySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),

  content: z
    .string()
    .min(1, "Content is required")
    .refine(
      (val) => {
        // Check if content has meaningful text (not just HTML tags)
        const textContent = val.replace(/<[^>]*>/g, "").trim();
        return textContent.length > 0;
      },
      {
        message: "Content cannot be empty",
      }
    ),

  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .trim()
    .optional(),

  coverImage: z.string().url("Cover image must be a valid URL").optional(),

  status: z.enum(["draft", "published"]).optional().default("draft"),

  tags: z
    .array(z.string().trim().toLowerCase())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

export type CreateStoryData = z.infer<typeof createStorySchema>;
