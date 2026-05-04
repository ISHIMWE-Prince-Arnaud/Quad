import { z } from "zod";
import { skipPaginationSchema } from "./pagination.schema.js";

/**
 * Story Status Enum
 */
const storyStatusSchema = z.enum(["draft", "published"]);

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateStory:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         content:
 *           type: string
 *           minLength: 1
 *         coverImage:
 *           type: string
 *           format: uri
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           default: draft
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
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
 * Extends shared skip pagination with higher limit (100 instead of 50)
 */
export const getStoriesQuerySchema = skipPaginationSchema.extend({
  limit: z.coerce.number().min(1).max(100).default(20),
});

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
