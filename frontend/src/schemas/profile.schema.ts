import { z } from "zod";

/**
 * Profile update schema aligned with backend PATCH /api/profile/:username
 * Validates profile information updates
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),
  profileImage: z.string().url("Invalid profile image URL").optional(),
  coverImage: z.string().url("Invalid cover image URL").optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
