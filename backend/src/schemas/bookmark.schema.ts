import { z } from "zod";

export const bookmarkContentTypes = ["post", "story", "poll"] as const;

export const createBookmarkSchema = z.object({
  contentType: z.enum(bookmarkContentTypes, { message: "Invalid content type" }),
  contentId: z.string().min(1, "Content ID is required"),
});

export const bookmarkParamsSchema = z.object({
  contentType: z.enum(bookmarkContentTypes),
  contentId: z.string().min(1, "Content ID is required"),
});

export const getBookmarksQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0"),

  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50"),

  contentType: z.enum(bookmarkContentTypes).optional(),
});

export type CreateBookmarkSchemaType = z.infer<typeof createBookmarkSchema>;
export type BookmarkParamsSchemaType = z.infer<typeof bookmarkParamsSchema>;
export type GetBookmarksQuerySchemaType = z.infer<typeof getBookmarksQuerySchema>;
