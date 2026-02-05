import { z } from "zod";

// ===========================
// FEED QUERY SCHEMA
// ===========================
export const feedQuerySchema = z.object({
  tab: z.enum(["home", "posts", "polls"]).optional().default("home"),

  cursor: z.string().optional(),

  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50"),

  sort: z.enum(["newest", "trending"]).optional().default("newest"),
});

export type FeedQuerySchemaType = z.infer<typeof feedQuerySchema>;

// ===========================
// NEW COUNT QUERY SCHEMA
// ===========================
export const newCountQuerySchema = z.object({
  feedType: z.enum(["following", "foryou"]),

  tab: z.enum(["home", "posts", "polls"]).optional().default("home"),

  since: z.string().min(1, "Since cursor is required"),
});

export type NewCountQuerySchemaType = z.infer<typeof newCountQuerySchema>;
