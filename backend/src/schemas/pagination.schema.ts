import { z } from "zod";

// ===========================
// SHARED PAGINATION SCHEMAS
// ===========================

/**
 * Cursor-based pagination
 * Used for: feeds, infinite scroll, real-time data
 * Benefits: Handles concurrent insertions, no skipped/duplicate items
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type CursorPaginationSchemaType = z.infer<typeof cursorPaginationSchema>;

/**
 * Offset-based pagination
 * Used for: admin panels, search results, ordered lists
 * Benefits: Simple page navigation, total count possible
 */
export const offsetPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type OffsetPaginationSchemaType = z.infer<typeof offsetPaginationSchema>;

/**
 * Skip-based pagination
 * Used for: simple infinite scroll, offset without page concept
 * Benefits: Direct offset control, simpler than page math
 */
export const skipPaginationSchema = z.object({
  skip: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type SkipPaginationSchemaType = z.infer<typeof skipPaginationSchema>;

/**
 * Sort direction helper
 */
export const sortDirectionSchema = z.enum(["asc", "desc"]).optional().default("desc");

export type SortDirectionSchemaType = z.infer<typeof sortDirectionSchema>;

/**
 * Common filter helpers
 */
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateRangeSchemaType = z.infer<typeof dateRangeSchema>;

/**
 * Search query helper
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
});

export type SearchQuerySchemaType = z.infer<typeof searchQuerySchema>;
