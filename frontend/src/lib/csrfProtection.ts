/**
 * CSRF Protection Utilities
 *
 * Provides Cross-Site Request Forgery protection for state-changing operations.
 * This should be coordinated with backend CSRF implementation.
 */

import { logError } from "./errorHandling";

/**
 * Generate a CSRF token
 * In production, this should be provided by the backend
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
  sessionStorage.setItem("csrf-token", token);
}

export function setCSRFToken(token: string): void {
  storeCSRFToken(token);
}

/**
 * Retrieve CSRF token from session storage
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem("csrf-token");
}

/**
 * Clear CSRF token from session storage
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem("csrf-token");
}

/**
 * Fetch CSRF token from backend
 * This should be called on app initialization
 */
export async function fetchCSRFToken(): Promise<string | null> {
  try {
    return null;
  } catch (error) {
    logError(error, { component: "CSRF", action: "fetchCSRFToken" });
    return null;
  }
}

/**
 * Validate CSRF token
 * This is a placeholder - actual validation happens on the backend
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken === token;
}

/**
 * Check if a request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  const stateMutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  return stateMutatingMethods.includes(method.toUpperCase());
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeader(
  headers: Record<string, string>
): Record<string, string> {
  const token = getCSRFToken();

  if (token) {
    return {
      ...headers,
      "X-CSRF-Token": token,
    };
  }

  return headers;
}

/**
 * Initialize CSRF protection
 * Call this on app startup
 */
export async function initializeCSRFProtection(): Promise<void> {
  // Check if we already have a token
  let token = getCSRFToken();

  if (!token) {
    // Fetch new token from backend
    token = await fetchCSRFToken();

    if (!token) {
      logError(new Error("Failed to initialize CSRF protection"), {
        component: "CSRF",
        action: "initializeCSRFProtection",
      });
    }
  }
}

/**
 * Refresh CSRF token
 * Call this after login or when token expires
 */
export async function refreshCSRFToken(): Promise<string | null> {
  clearCSRFToken();
  return await fetchCSRFToken();
}

/**
 * CSRF token middleware for fetch requests
 */
export function csrfFetchMiddleware(
  _url: string,
  options: RequestInit = {}
): RequestInit {
  const method = options.method || "GET";

  if (requiresCSRFProtection(method)) {
    const token = getCSRFToken();

    if (token) {
      return {
        ...options,
        headers: {
          ...options.headers,
          "X-CSRF-Token": token,
        },
      };
    }
  }

  return options;
}

/**
 * Hook for CSRF-protected fetch
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const protectedOptions = csrfFetchMiddleware(url, options);
  return fetch(url, protectedOptions);
}
