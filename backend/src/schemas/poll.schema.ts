import { z } from "zod";

// ===========================
// MEDIA SCHEMA (reusable)
// ===========================
const mediaSchema = z
  .object({
    url: z.string().url("Invalid media URL"),
    type: z.enum(["image", "video"]),
    aspectRatio: z.enum(["1:1", "16:9", "9:16"]).optional(),
  })
  .strict();

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePoll:
 *       type: object
 *       required:
 *         - question
 *         - options
 *       properties:
 *         question:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *           minItems: 2
 *           maxItems: 5
 *         expiresAt:
 *           type: string
 *           format: date-time
 */
export const createPollSchema = z
  .object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be at most 500 characters")
    .trim(),
  
  questionMedia: mediaSchema.optional(),
  
  options: z
    .array(
      z
        .object({
          text: z
            .string()
            .min(1, "Option text is required")
            .max(200, "Option text must be at most 200 characters")
            .trim(),
          media: mediaSchema.optional(),
        })
        .strict()
    )
    .min(2, "Poll must have at least 2 options")
    .max(5, "Poll must have at most 5 options")
    .refine(
      (options) => {
        // Check for duplicate option texts (case-insensitive)
        const texts = options.map(opt => opt.text.toLowerCase().trim());
        const uniqueTexts = new Set(texts);
        return texts.length === uniqueTexts.size;
      },
      {
        message: "Poll options must have unique text"
      }
    ),
  
  settings: z
    .object({
      allowMultiple: z.boolean().optional().default(false),
      anonymousVoting: z.boolean().optional().default(false),
      showResults: z
        .enum(["always", "afterVote", "afterExpiry"])
        .optional()
        .default("afterVote"),
    })
    .strict()
    .optional()
    .default({
      allowMultiple: false,
      anonymousVoting: false,
      showResults: "afterVote"
    }),
  
  expiresAt: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine(
      (date) => date > new Date(),
      {
        message: "Expiration date must be in the future"
      }
    )
    .optional(),
  })
  .strict();

export type CreatePollSchemaType = z.infer<typeof createPollSchema>;

// ===========================
// UPDATE POLL SCHEMA
// ===========================
export const updatePollSchema = z
  .object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be at most 500 characters")
    .trim()
    .optional(),
  
  questionMedia: mediaSchema.optional(),
  })
  .strict();

export type UpdatePollSchemaType = z.infer<typeof updatePollSchema>;

// ===========================
// VOTE ON POLL SCHEMA
// ===========================
export const voteOnPollSchema = z
  .object({
    optionIndices: z
      .array(z.number().int().nonnegative())
      .min(1, "Must select at least 1 option")
      .max(5, "Cannot select more than 5 options")
      .refine(
        (indices) => {
          // Check for duplicate indices
          const uniqueIndices = new Set(indices);
          return indices.length === uniqueIndices.size;
        },
        {
          message: "Cannot select the same option multiple times"
        }
      ),
  })
  .strict();

export type VoteOnPollSchemaType = z.infer<typeof voteOnPollSchema>;

// ===========================
// POLL ID SCHEMA
// ===========================
export const pollIdSchema = z
  .object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid poll ID format"),
  })
  .strict();

export type PollIdSchemaType = z.infer<typeof pollIdSchema>;

// ===========================
// GET POLLS QUERY SCHEMA
// ===========================
export const getPollsQuerySchema = z
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
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 50, "Limit must be between 1 and 50"),
  
  // Filters
  status: z
    .enum(["active", "expired", "closed", "all"])
    .optional()
    .default("all"),
  
  author: z.string().optional(), // Filter by author clerkId
  
  voted: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true" ? true : val === "false" ? false : undefined),
  
  // Sorting
  sort: z
    .enum(["newest", "oldest", "trending", "mostVotes"])
    .optional()
    .default("newest"),
  })
  .strict();

export type GetPollsQuerySchemaType = z.infer<typeof getPollsQuerySchema>;
