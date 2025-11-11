import { z } from "zod";

// ===========================
// MEDIA SCHEMA (reusable)
// ===========================
const mediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: z.enum(["image", "video"]),
  aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
});

// ===========================
// CREATE MESSAGE SCHEMA
// ===========================
export const createMessageSchema = z
  .object({
    text: z.string().optional(),
    media: mediaSchema.optional(),
  })
  .refine((data) => data.text || data.media, {
    message: "Message must have text or media",
  });

export type CreateMessageSchemaType = z.infer<typeof createMessageSchema>;

// ===========================
// UPDATE MESSAGE SCHEMA
// ===========================
export const updateMessageSchema = z
  .object({
    text: z.string().optional(),
    media: mediaSchema.nullable().optional(), // null = remove media
  })
  .refine((data) => data.text !== undefined || data.media !== undefined, {
    message: "Must provide text or media to update",
  });

export type UpdateMessageSchemaType = z.infer<typeof updateMessageSchema>;

// ===========================
// ADD REACTION SCHEMA
// ===========================
export const addReactionSchema = z.object({
  emoji: z.string().min(1, "Emoji is required").max(10, "Emoji too long"),
});

export type AddReactionSchemaType = z.infer<typeof addReactionSchema>;

// ===========================
// MESSAGE ID SCHEMA
// ===========================
export const messageIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format"),
});

export type MessageIdSchemaType = z.infer<typeof messageIdSchema>;

// ===========================
// GET MESSAGES QUERY SCHEMA
// ===========================
export const getMessagesQuerySchema = z.object({
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
});

export type GetMessagesQuerySchemaType = z.infer<typeof getMessagesQuerySchema>;

// ===========================
// MARK AS READ SCHEMA
// ===========================
export const markAsReadSchema = z.object({
  lastReadMessageId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid message ID format"),
});

export type MarkAsReadSchemaType = z.infer<typeof markAsReadSchema>;
