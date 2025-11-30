import { z } from "zod";

/**
 * Chat message media schema
 */
export const chatMediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: z.enum(["image", "video"], {
    message: "Media type must be either image or video",
  }),
});

/**
 * Chat message creation schema aligned with backend POST /api/chat/messages
 */
export const sendMessageSchema = z
  .object({
    text: z
      .string()
      .max(2000, "Message must be less than 2000 characters")
      .trim()
      .optional(),
    media: chatMediaSchema.optional(),
  })
  .refine(
    (data) => {
      // At least one of text or media must be present
      const hasText = data.text && data.text.trim().length > 0;
      const hasMedia = data.media !== undefined;
      return hasText || hasMedia;
    },
    {
      message: "Message must have text or media",
      path: ["text"],
    }
  );

/**
 * Chat message edit schema aligned with backend PATCH /api/chat/messages/:id
 */
export const editMessageSchema = z.object({
  text: z
    .string()
    .min(1, "Message text is required")
    .max(2000, "Message must be less than 2000 characters")
    .trim()
    .refine(
      (val) => {
        return val.trim().length > 0;
      },
      {
        message: "Message cannot be empty",
      }
    ),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type EditMessageData = z.infer<typeof editMessageSchema>;
export type ChatMediaData = z.infer<typeof chatMediaSchema>;
