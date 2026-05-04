import { z } from "zod";
import { offsetPaginationSchema } from "./pagination.schema.js";

export const bookmarkContentTypes = ["post", "story", "poll"] as const;

export const createBookmarkSchema = z.object({
  contentType: z.enum(bookmarkContentTypes, { message: "Invalid content type" }),
  contentId: z.string().min(1, "Content ID is required"),
});

export const bookmarkParamsSchema = z.object({
  contentType: z.enum(bookmarkContentTypes),
  contentId: z.string().min(1, "Content ID is required"),
});

export const getBookmarksQuerySchema = offsetPaginationSchema.extend({
  contentType: z.enum(bookmarkContentTypes).optional(),
});

export type CreateBookmarkSchemaType = z.infer<typeof createBookmarkSchema>;
export type BookmarkParamsSchemaType = z.infer<typeof bookmarkParamsSchema>;
export type GetBookmarksQuerySchemaType = z.infer<typeof getBookmarksQuerySchema>;
