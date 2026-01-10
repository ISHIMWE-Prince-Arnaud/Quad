import { z } from "zod";

export const getAnalyticsQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  profileId: z.string().optional(),
});

export type GetAnalyticsQuerySchemaType = z.infer<typeof getAnalyticsQuerySchema>;
