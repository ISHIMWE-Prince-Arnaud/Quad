import { z } from "zod";

// Create User
export const createUserSchema = z.object({
  clerkId: z.string().min(1, "User ID is required"), // Clerk user ID
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  profileImage: z.string().url().optional(),
  bio: z.string().max(200).optional(),
});

// Update User (all fields optional)
export const updateUserSchema = createUserSchema.partial();

// Get User (by ID)
export const getUserSchema = z.object({
  clerkId: z.string().min(1, "User ID is required"),
});

// ✅ Delete User (by ID)
export const deleteUserSchema = z.object({
  clerkId: z.string().min(1, "User ID is required"),
});

// ✅ Types
export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type GetUserSchemaType = z.infer<typeof getUserSchema>;
export type DeleteUserSchemaType = z.infer<typeof deleteUserSchema>;