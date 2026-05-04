import { z } from "zod";
import { offsetPaginationSchema } from "./pagination.schema.js";

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
export const getNotificationsQuerySchema = offsetPaginationSchema.extend({
  unreadOnly: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

export type GetNotificationsQuerySchemaType = z.infer<typeof getNotificationsQuerySchema>;
