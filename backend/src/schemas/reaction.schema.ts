import { z } from "zod";

// Valid reaction types
export const reactionTypes = ["love"] as const;

// Valid content types that can be reacted to
export const reactableContentTypes = ["post", "story", "poll", "comment"] as const;

// ---------------------
// CREATE/UPDATE REACTION
// ---------------------
export const createReactionSchema = z.object({
  contentType: z.enum(reactableContentTypes, {
    message: "Invalid content type"
  }),
  contentId: z.string().min(1, "Content ID is required"),
  type: z.enum(reactionTypes, {
    message: "Invalid reaction type"
  }),
});

// ---------------------
// DELETE REACTION
// ---------------------
export const deleteReactionSchema = z.object({
  contentType: z.enum(reactableContentTypes),
  contentId: z.string().min(1, "Content ID is required"),
});

// ---------------------
// GET REACTIONS BY CONTENT
// ---------------------
export const getReactionsByContentSchema = z.object({
  contentType: z.enum(reactableContentTypes),
  contentId: z.string().min(1, "Content ID is required"),
});

// ---------------------
// Types
// ---------------------
export type CreateReactionSchemaType = z.infer<typeof createReactionSchema>;
export type DeleteReactionSchemaType = z.infer<typeof deleteReactionSchema>;
export type GetReactionsByContentSchemaType = z.infer<typeof getReactionsByContentSchema>;
