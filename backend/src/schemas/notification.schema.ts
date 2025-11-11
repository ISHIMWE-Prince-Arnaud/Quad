import { z } from "zod";

// ===========================
// NOTIFICATION ID PARAM SCHEMA
// ===========================
export const notificationIdParamSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

export type NotificationIdParamSchemaType = z.infer<typeof notificationIdParamSchema>;

// ===========================
// GET NOTIFICATIONS QUERY SCHEMA
// ===========================
export const getNotificationsQuerySchema = z.object({
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

  unreadOnly: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

export type GetNotificationsQuerySchemaType = z.infer<typeof getNotificationsQuerySchema>;
