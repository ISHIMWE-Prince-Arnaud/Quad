import { z } from "zod";

/**
 * Poll media schema matching backend requirements
 */
export const pollMediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: z.enum(["image", "video"], {
    message: "Media type must be either image or video",
  }),
  aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
});

/**
 * Poll option schema for creation
 */
export const createPollOptionSchema = z.object({
  text: z
    .string()
    .min(1, "Option text is required")
    .max(200, "Option text must be at most 200 characters")
    .trim(),
  media: pollMediaSchema.optional(),
});

/**
 * Poll settings schema
 */
export const pollSettingsSchema = z.object({
  allowMultiple: z.boolean().optional().default(false),
  showResults: z
    .enum(["always", "afterVote", "afterExpiry"])
    .optional()
    .default("afterVote"),
});

/**
 * Poll creation schema aligned with backend POST /api/polls
 */
export const createPollSchema = z
  .object({
    question: z
      .string()
      .min(10, "Question must be at least 10 characters")
      .max(500, "Question must be at most 500 characters")
      .trim(),
    questionMedia: pollMediaSchema.optional(),
    options: z
      .array(createPollOptionSchema)
      .min(2, "Poll must have at least 2 options")
      .max(5, "Poll must have at most 5 options"),
    settings: pollSettingsSchema.optional(),
    expiresAt: z
      .string()
      .datetime()
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          return new Date(date) > new Date();
        },
        {
          message: "Expiration date must be in the future",
        }
      ),
  })
  .refine(
    (data) => {
      // Check for duplicate option texts (case-insensitive)
      const texts = data.options.map((opt) => opt.text.toLowerCase().trim());
      const uniqueTexts = new Set(texts);
      return texts.length === uniqueTexts.size;
    },
    {
      message: "Poll options must have unique text",
      path: ["options"],
    }
  );

export type CreatePollData = z.infer<typeof createPollSchema>;
export type PollMediaData = z.infer<typeof pollMediaSchema>;
export type CreatePollOptionData = z.infer<typeof createPollOptionSchema>;
export type PollSettingsData = z.infer<typeof pollSettingsSchema>;
