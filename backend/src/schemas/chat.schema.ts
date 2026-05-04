import { z } from "zod";
import { offsetPaginationSchema } from "./pagination.schema.js";

// ===========================
// CREATE MESSAGE SCHEMA
// ===========================
export const createMessageSchema = z
  .object({
    text: z.string().trim().min(1, "Message text is required"),
  })
  .strict();

export type CreateMessageSchemaType = z.infer<typeof createMessageSchema>;

// ===========================
// UPDATE MESSAGE SCHEMA
// ===========================
export const updateMessageSchema = z
  .object({
    text: z.string().optional(),
  })
  .strict()
  .refine((data) => data.text !== undefined, {
    message: "Must provide text to update",
  });

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;

// ===========================
// MESSAGE ID SCHEMA
// ===========================
export const messageIdSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format"),
  })
  .strict();

export type MessageIdSchemaType = z.infer<typeof messageIdSchema>;

// ===========================
// GET MESSAGES QUERY SCHEMA
// ===========================
export const getMessagesQuerySchema = offsetPaginationSchema.extend({
  // Use 'before' to filter messages before a specific message ID (for infinite scroll)
  before: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format")
    .optional(),
});

export type GetMessagesQuerySchemaType = z.infer<typeof getMessagesQuerySchema>;

// ===========================
// MARK AS READ SCHEMA
// ===========================
export const markAsReadSchema = z
  .object({
    lastReadMessageId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format"),
  })
  .strict();

export type MarkAsReadSchemaType = z.infer<typeof markAsReadSchema>;
