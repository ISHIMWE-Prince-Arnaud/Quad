// Security utilities for the Quad application

/**
 * Sanitize user input to prevent XSS attacks
 * This function escapes HTML special characters
 */
export { sanitizeInput } from "./security/sanitize";

/**
 * Sanitize HTML content while preserving safe tags
 * This is a basic implementation - for production, consider using DOMPurify
 */
export { sanitizeHTML } from "./security/sanitize";

/**
 * Strip all HTML tags from input
 */
export { stripHTML } from "./security/sanitize";

/**
 * Sanitize user input for display in React components
 * Use this when displaying user-generated content
 */
export { sanitizeForDisplay } from "./security/sanitize";

/**
 * Validate and sanitize URLs to prevent malicious redirects
 */
export { validateUrl } from "./security/urls";

/**
 * Generate a secure random string for CSP nonces
 */
export { generateNonce } from "./security/csp";

/**
 * Validate file types for uploads
 */
export { validateFileType } from "./security/files";

/**
 * Validate file size
 */
export { validateFileSize } from "./security/files";

/**
 * Rate limiting helper (client-side basic implementation)
 */
export { ClientRateLimiter } from "./security/rateLimiter";

/**
 * Content Security Policy helpers
 */
export { CSP_DIRECTIVES } from "./security/csp";

/**
 * Secure local storage wrapper
 */
export { SecureStorage } from "./security/storage";

/**
 * Permission checking utilities
 */
export { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from "./security/permissions";

export type { PermissionType } from "./security/permissions";

/**
 * Validate file extension matches MIME type
 * Helps prevent file type spoofing
 */
export { validateFileExtension } from "./security/files";

/**
 * Comprehensive file validation
 */
export type { FileValidationOptions, FileValidationResult } from "./security/files";

export { validateFile } from "./security/files";
