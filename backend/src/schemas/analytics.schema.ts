import { z } from "zod";

export const getAnalyticsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  profileId: z.string().optional(),
});

export const getContentAnalyticsQuerySchema = z.object({
  contentType: z.enum(["post", "story", "poll"]).optional(),
});

export type GetAnalyticsQuerySchemaType = z.infer<typeof getAnalyticsQuerySchema>;
export type GetContentAnalyticsQuerySchemaType = z.infer<typeof getContentAnalyticsQuerySchema>;
