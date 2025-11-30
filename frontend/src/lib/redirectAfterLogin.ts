/**
 * Utilities for handling redirects after login
 */

const REDIRECT_KEY = "redirectAfterLogin";
const DEFAULT_REDIRECT = "/app/feed";

/**
 * Save the intended destination before redirecting to login
 */
export function saveIntendedDestination(path: string): void {
  // Don't save login/signup pages as redirect destination
  if (path.includes("/login") || path.includes("/signup")) {
    return;
  }

  sessionStorage.setItem(REDIRECT_KEY, path);
}

/**
 * Get the intended destination after login
 */
export function getIntendedDestination(): string {
  const saved = sessionStorage.getItem(REDIRECT_KEY);

  // Clear the saved destination
  if (saved) {
    sessionStorage.removeItem(REDIRECT_KEY);
  }

  // Return saved destination or default
  return saved || DEFAULT_REDIRECT;
}

/**
 * Clear the saved redirect destination
 */
export function clearIntendedDestination(): void {
  sessionStorage.removeItem(REDIRECT_KEY);
}

/**
 * Check if there's a saved redirect destination
 */
export function hasIntendedDestination(): boolean {
  return !!sessionStorage.getItem(REDIRECT_KEY);
}
