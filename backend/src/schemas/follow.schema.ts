import { z } from "zod";

// ===========================
// USER ID PARAM SCHEMA
// ===========================
export const userIdParamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type UserIdParamSchemaType = z.infer<typeof userIdParamSchema>;

// ===========================
// GET FOLLOWERS/FOLLOWING QUERY SCHEMA
// ===========================
export const getFollowListQuerySchema = z.object({
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
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
});

export type GetFollowListQuerySchemaType = z.infer<typeof getFollowListQuerySchema>;
