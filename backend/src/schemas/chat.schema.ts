import { z } from "zod";

// ===========================
// CREATE MESSAGE SCHEMA
// ===========================
export const createMessageSchema = z
  .object({
    text: z.string().min(1, "Message text is required"),
  })
  .strict()
  .refine((data) => data.text.trim().length > 0, {
    message: "Message must have text",
  });

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
// ADD REACTION SCHEMA
// ===========================
export const addReactionSchema = z
  .object({
    emoji: z.literal("❤️"),
  })
  .strict();

export type AddReactionSchemaType = z.infer<typeof addReactionSchema>;

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
export const getMessagesQuerySchema = z
  .object({
  // Pagination
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

  // Get messages before a specific message ID (for infinite scroll)
  before: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format")
    .optional(),
  })
  .strict();

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
