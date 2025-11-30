// Security utilities for the Quad application

/**
 * Sanitize user input to prevent XSS attacks
 * This function escapes HTML special characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize HTML content while preserving safe tags
 * This is a basic implementation - for production, consider using DOMPurify
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";

  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Strip all HTML tags from input
 */
export function stripHTML(input: string): string {
  if (!input) return "";

  const temp = document.createElement("div");
  temp.innerHTML = input;
  return temp.textContent || temp.innerText || "";
}

/**
 * Sanitize user input for display in React components
 * Use this when displaying user-generated content
 */
export function sanitizeForDisplay(input: string): string {
  if (!input) return "";

  // Remove any script tags and their content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  return sanitized;
}

/**
 * Validate and sanitize URLs to prevent malicious redirects
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTP and HTTPS protocols
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random string for CSP nonces
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Validate file types for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Rate limiting helper (client-side basic implementation)
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the time window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://clerk.com",
    "https://*.clerk.accounts.dev",
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://api.clerk.com", "wss://"],
  fontSrc: ["'self'", "https:", "data:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["https://clerk.com", "https://*.clerk.accounts.dev"],
} as const;

/**
 * Secure local storage wrapper
 */
export class SecureStorage {
  private static readonly PREFIX = "quad_secure_";

  static setItem(key: string, value: string, encrypt = false): void {
    const finalKey = this.PREFIX + key;
    let finalValue = value;

    if (encrypt) {
      // In a real app, you'd use proper encryption here
      finalValue = btoa(value);
    }

    try {
      localStorage.setItem(finalKey, finalValue);
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }

  static getItem(key: string, decrypt = false): string | null {
    const finalKey = this.PREFIX + key;

    try {
      const value = localStorage.getItem(finalKey);
      if (!value) return null;

      if (decrypt) {
        return atob(value);
      }

      return value;
    } catch (error) {
      console.warn("Failed to read from localStorage:", error);
      return null;
    }
  }

  static removeItem(key: string): void {
    const finalKey = this.PREFIX + key;
    localStorage.removeItem(finalKey);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

/**
 * Permission checking utilities
 */
export const Permission = {
  CREATE_POST: "create:post",
  EDIT_POST: "edit:post",
  DELETE_POST: "delete:post",
  MODERATE_CONTENT: "moderate:content",
  ADMIN_ACCESS: "admin:access",
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

export function hasPermission(
  userPermissions: string[],
  required: PermissionType
): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: string[],
  required: PermissionType[]
): boolean {
  return required.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: string[],
  required: PermissionType[]
): boolean {
  return required.every((permission) => userPermissions.includes(permission));
}

/**
 * Validate file extension matches MIME type
 * Helps prevent file type spoofing
 */
export function validateFileExtension(file: File): boolean {
  if (!file || !file.name) return false;

  const extension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const validMappings: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    gif: ["image/gif"],
    webp: ["image/webp"],
    mp4: ["video/mp4"],
    webm: ["video/webm"],
    pdf: ["application/pdf"],
  };

  if (!extension || !validMappings[extension]) {
    return false;
  }

  return validMappings[extension].includes(mimeType);
}

/**
 * Comprehensive file validation
 */
export interface FileValidationOptions {
  allowedTypes: string[];
  maxSizeBytes: number;
  checkExtension?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size
  if (!validateFileSize(file, options.maxSizeBytes)) {
    const maxSizeMB = (options.maxSizeBytes / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  // Check file type
  if (!validateFileType(file, options.allowedTypes)) {
    return { valid: false, error: "File type not allowed" };
  }

  // Check extension matches MIME type
  if (options.checkExtension !== false && !validateFileExtension(file)) {
    return { valid: false, error: "File extension does not match file type" };
  }

  return { valid: true };
}
