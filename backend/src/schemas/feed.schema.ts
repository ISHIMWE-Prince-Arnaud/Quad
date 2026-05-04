import { z } from "zod";
import { cursorPaginationSchema } from "./pagination.schema.js";

// ===========================
// FEED QUERY SCHEMA
// ===========================
export const feedQuerySchema = z.object({
  tab: z.enum(["home", "posts", "polls"]).optional().default("home"),
  sort: z.enum(["newest", "trending"]).optional().default("newest"),
}).merge(cursorPaginationSchema);

export type FeedQuerySchemaType = z.infer<typeof feedQuerySchema>;
