import { z } from "zod";

/**
 * Search query schema for validating search inputs
 */
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(200, "Search query must be less than 200 characters")
    .trim(),
  type: z
    .enum(["all", "users", "posts", "stories", "polls"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["relevance", "date", "popularity"])
    .optional()
    .default("relevance"),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  page: z.number().int().min(1).optional().default(1),
});

/**
 * Search filter schema for advanced filtering
 */
export const searchFilterSchema = z
  .object({
    contentType: z.enum(["post", "story", "poll", "user"]).array().optional(),
    dateRange: z
      .object({
        from: z.string().datetime(),
        to: z.string().datetime(),
      })
      .optional(),
    sortBy: z.enum(["relevance", "date", "popularity"]).optional(),
  })
  .refine(
    (data) => {
      // If dateRange is provided, ensure 'from' is before 'to'
      if (data.dateRange) {
        const from = new Date(data.dateRange.from);
        const to = new Date(data.dateRange.to);
        return from < to;
      }
      return true;
    },
    {
      message: "Start date must be before end date",
      path: ["dateRange"],
    }
  );

export type SearchQueryData = z.infer<typeof searchQuerySchema>;
export type SearchFilterData = z.infer<typeof searchFilterSchema>;
