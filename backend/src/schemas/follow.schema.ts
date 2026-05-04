import { z } from "zod";
import { offsetPaginationSchema } from "./pagination.schema.js";

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
export const getFollowListQuerySchema = offsetPaginationSchema.extend({
  limit: z.coerce.number().min(1).max(100).default(20), // Follow lists allow up to 100
});

export type GetFollowListQuerySchemaType = z.infer<typeof getFollowListQuerySchema>;
