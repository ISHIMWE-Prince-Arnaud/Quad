import { z } from "zod";

// ===========================
// UPDATE PROFILE SCHEMA
// ===========================
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name must be at least 1 character")
    .max(50, "First name must not exceed 50 characters")
    .optional(),

  lastName: z
    .string()
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name must not exceed 50 characters")
    .optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .optional(),

  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .optional(),

  profileImage: z
    .string()
    .url("Invalid profile image URL")
    .optional(),

  coverImage: z
    .string()
    .url("Invalid cover image URL")
    .optional(),

  // Legacy field kept for backwards compatibility
  displayName: z
    .string()
    .min(1, "Display name must be at least 1 character")
    .max(50, "Display name must not exceed 50 characters")
    .optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;

// ===========================
// USERNAME PARAM SCHEMA
// ===========================
export const usernameParamSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(30, "Username is too long"),
});

export type UsernameParamSchemaType = z.infer<typeof usernameParamSchema>;

// ===========================
// PAGINATION QUERY SCHEMA
// ===========================
export const paginationQuerySchema = z.object({
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
});

export type PaginationQuerySchemaType = z.infer<typeof paginationQuerySchema>;
