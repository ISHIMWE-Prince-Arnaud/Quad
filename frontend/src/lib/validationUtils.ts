import { z } from "zod";

/**
 * Common validation utilities and custom validators
 */

/**
 * Validates that a string contains only alphanumeric characters and underscores
 */
export const usernameValidator = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

/**
 * Validates email format
 */
export const emailValidator = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

/**
 * Validates URL format
 */
export const urlValidator = z.string().url("Invalid URL format");

/**
 * Validates that a string is not just whitespace
 */
export const nonEmptyStringValidator = (
  fieldName: string,
  maxLength?: number
) => {
  let validator = z
    .string()
    .min(1, `${fieldName} is required`)
    .trim()
    .refine(
      (val) => val.trim().length > 0,
      `${fieldName} cannot be empty or just whitespace`
    );

  if (maxLength) {
    validator = validator.max(
      maxLength,
      `${fieldName} must be less than ${maxLength} characters`
    ) as any;
  }

  return validator;
};

/**
 * Validates file size (in bytes)
 */
export const fileSizeValidator = (maxSizeInMB: number) => {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return z
    .instanceof(File)
    .refine(
      (file) => file.size <= maxBytes,
      `File size must be less than ${maxSizeInMB}MB`
    );
};

/**
 * Validates file type
 */
export const fileTypeValidator = (allowedTypes: string[]) => {
  return z
    .instanceof(File)
    .refine(
      (file) => allowedTypes.includes(file.type),
      `File type must be one of: ${allowedTypes.join(", ")}`
    );
};

/**
 * Validates image file (type and size)
 */
export const imageFileValidator = (maxSizeInMB: number = 10) => {
  return z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "File must be an image")
    .refine(
      (file) => file.size <= maxSizeInMB * 1024 * 1024,
      `Image size must be less than ${maxSizeInMB}MB`
    );
};

/**
 * Validates video file (type and size)
 */
export const videoFileValidator = (maxSizeInMB: number = 50) => {
  return z
    .instanceof(File)
    .refine((file) => file.type.startsWith("video/"), "File must be a video")
    .refine(
      (file) => file.size <= maxSizeInMB * 1024 * 1024,
      `Video size must be less than ${maxSizeInMB}MB`
    );
};

/**
 * Validates date is in the future
 */
export const futureDateValidator = z
  .string()
  .datetime()
  .refine((date) => new Date(date) > new Date(), "Date must be in the future");

/**
 * Validates date is in the past
 */
export const pastDateValidator = z
  .string()
  .datetime()
  .refine((date) => new Date(date) < new Date(), "Date must be in the past");

/**
 * Validates date range (from < to)
 */
export const dateRangeValidator = z
  .object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .refine(
    (data) => new Date(data.from) < new Date(data.to),
    "Start date must be before end date"
  );

/**
 * Validates array has unique values
 */
export const uniqueArrayValidator = <T>(
  array: T[],
  getMessage: (duplicates: T[]) => string
) => {
  const seen = new Set<T>();
  const duplicates: T[] = [];

  for (const item of array) {
    if (seen.has(item)) {
      duplicates.push(item);
    } else {
      seen.add(item);
    }
  }

  return {
    valid: duplicates.length === 0,
    message: duplicates.length > 0 ? getMessage(duplicates) : undefined,
  };
};

/**
 * Sanitizes HTML content to prevent XSS
 * Note: This is a basic sanitizer. For production, use a library like DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "");
};

/**
 * Validates and sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (
  error: z.ZodError
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Zod v4 uses 'issues' instead of 'errors'
  const issues = error.issues || (error as any).errors || [];

  issues.forEach((err: any) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });

  return errors;
};

/**
 * Validate data against a schema and return formatted errors
 */
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatValidationErrors(result.error),
  };
};
