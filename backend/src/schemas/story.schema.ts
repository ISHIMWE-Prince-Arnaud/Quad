import { z } from "zod";

/**
 * Story Status Enum
 */
const storyStatusSchema = z.enum(["draft", "published"]);

/**
 * CREATE STORY SCHEMA
 * Validates data when creating a new story
 */
export const createStorySchema = z
  .object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  
  content: z
    .string()
    .min(1, "Content is required"),
  
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .trim()
    .optional(),
  
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional(),
  
  status: storyStatusSchema
    .optional()
    .default("draft"),
  
  tags: z
    .array(z.string().trim().toLowerCase())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  })
  .strict();

export type CreateStorySchemaType = z.infer<typeof createStorySchema>;

/**
 * UPDATE STORY SCHEMA
 * Validates data when updating an existing story
 * All fields optional
 */
export const updateStorySchema = z
  .object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .optional(),
  
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .trim()
    .optional(),
  
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .nullable()  // Allow null to remove cover image
    .optional(),
  
  status: storyStatusSchema
    .optional(),
  
  tags: z
    .array(z.string().trim().toLowerCase())
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  })
  .strict();

export type UpdateStorySchemaType = z.infer<typeof updateStorySchema>;

/**
 * STORY ID SCHEMA
 * Validates MongoDB ObjectId in params
 */
export const storyIdSchema = z
  .object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid story ID format"),
  })
  .strict();

export type StoryIdSchemaType = z.infer<typeof storyIdSchema>;

/**
 * GET STORIES QUERY SCHEMA
 * Validates query parameters for fetching stories
 */
export const getStoriesQuerySchema = z
  .object({
  status: storyStatusSchema.optional(),
  
  tag: z
    .string()
    .trim()
    .toLowerCase()
    .optional(),
  
  authorId: z
    .string()
    .optional(),
  
  search: z
    .string()
    .trim()
    .optional(),
  
  limit: z
    .string()
    .optional()
    .default("20")
    .refine((val) => /^\d+$/.test(val), "Limit must be a number")
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  
  skip: z
    .string()
    .optional()
    .default("0")
    .refine((val) => /^\d+$/.test(val), "Skip must be a number")
    .transform(Number)
    .refine((val) => val >= 0, "Skip must be non-negative"),
  
  sortBy: z
    .enum(["newest", "oldest", "popular", "views"])
    .optional()
    .default("newest"),
  })
  .strict();

export type GetStoriesQuerySchemaType = z.infer<typeof getStoriesQuerySchema>;

/**
 * PUBLISH STORY SCHEMA
 * Validates publishing action (changing draft to published)
 */
export const publishStorySchema = z
  .object({
    status: z.literal("published"),
  })
  .strict();

export type PublishStorySchemaType = z.infer<typeof publishStorySchema>;
