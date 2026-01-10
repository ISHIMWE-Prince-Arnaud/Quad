import { z } from "zod";

// Create User
export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  bio: z.string().max(200).optional(),
});

// Update User Profile (all editable fields optional)
export const updateUserProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  bio: z.string().max(200).optional(),
});

// Get User (by ID)
export const getUserSchema = z.object({
  clerkId: z.string().min(1, "User ID is required"),
});

// Delete User (by ID)
export const deleteUserSchema = z.object({
  clerkId: z.string().min(1, "User ID is required"),
});

// Types
export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type UpdateUserProfileSchemaType = z.infer<typeof updateUserProfileSchema>;
export type GetUserSchemaType = z.infer<typeof getUserSchema>;
export type DeleteUserSchemaType = z.infer<typeof deleteUserSchema>;