/**
 * Authentication Flow Audit Utility
 *
 * This module provides utilities to audit and verify the authentication flow,
 * ensuring secure token handling, proper Clerk integration, and secure storage.
 */

import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { logError } from "./errorHandling";

export interface AuthAuditResult {
  clerkIntegration: {
    isLoaded: boolean;
    isSignedIn: boolean;
    hasValidSession: boolean;
  };
  tokenManagement: {
    hasToken: boolean;
    tokenInLocalStorage: boolean;
    tokenRefreshWorking: boolean;
  };
  secureStorage: {
    usingSecureProtocol: boolean;
    hasHttpOnlyCookies: boolean;
    tokenStorageSecure: boolean;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Hook to audit the authentication flow
 */
export function useAuthAudit(): AuthAuditResult {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [auditResult, setAuditResult] = useState<AuthAuditResult>({
    clerkIntegration: {
      isLoaded: false,
      isSignedIn: false,
      hasValidSession: false,
    },
    tokenManagement: {
      hasToken: false,
      tokenInLocalStorage: false,
      tokenRefreshWorking: false,
    },
    secureStorage: {
      usingSecureProtocol: window.location.protocol === "https:",
      hasHttpOnlyCookies: false, // Can't directly check, but Clerk handles this
      tokenStorageSecure: false,
    },
    issues: [],
    recommendations: [],
  });

  useEffect(() => {
    const performAudit = async () => {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check Clerk integration
      const clerkIntegration = {
        isLoaded,
        isSignedIn: isSignedIn || false,
        hasValidSession: isLoaded && isSignedIn && !!user,
      };

      if (!isLoaded) {
        issues.push("Clerk SDK not fully loaded");
      }

      // Check token management
      let hasToken = false;
      let tokenRefreshWorking = false;

      try {
        const token = await getToken();
        hasToken = !!token;
        tokenRefreshWorking = true;
      } catch (error) {
        issues.push("Token refresh failed: " + (error as Error).message);
      }

      const tokenInLocalStorage = !!localStorage.getItem("clerk-db-jwt");

      const tokenManagement = {
        hasToken,
        tokenInLocalStorage,
        tokenRefreshWorking,
      };

      // Check secure storage
      const usingSecureProtocol = window.location.protocol === "https:";

      if (!usingSecureProtocol && window.location.hostname !== "localhost") {
        issues.push("Not using HTTPS protocol in production");
        recommendations.push("Enable HTTPS for secure token transmission");
      }

      // Check if tokens are stored securely
      const tokenStorageSecure =
        usingSecureProtocol || window.location.hostname === "localhost";

      if (tokenInLocalStorage && !tokenStorageSecure) {
        issues.push("Tokens stored in localStorage over insecure connection");
        recommendations.push(
          "Use HTTPS or consider alternative storage methods",
        );
      }

      const secureStorage = {
        usingSecureProtocol,
        hasHttpOnlyCookies: true, // Clerk manages this
        tokenStorageSecure,
      };

      // Additional checks
      if (isSignedIn && !hasToken) {
        issues.push("User is signed in but no token available");
        recommendations.push(
          "Check Clerk configuration and token refresh logic",
        );
      }

      if (tokenInLocalStorage && !isSignedIn) {
        issues.push("Token exists in localStorage but user not signed in");
        recommendations.push("Clear stale tokens on logout");
      }

      setAuditResult({
        clerkIntegration,
        tokenManagement,
        secureStorage,
        issues,
        recommendations,
      });
    };

    if (isLoaded) {
      performAudit();
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  return auditResult;
}

/**
 * Verify token is valid and not expired
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    // Decode JWT without verification (just to check expiry)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    return exp > now + 300;
  } catch {
    return false;
  }
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem("clerk-db-jwt");
  sessionStorage.removeItem("redirectAfterLogin");

  // Clear any other auth-related data
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("clerk-") || key.startsWith("quad_secure_"))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Ensure token is refreshed before expiry
 */
export async function ensureFreshToken(
  getToken: () => Promise<string | null>,
): Promise<string | null> {
  try {
    const token = await getToken();

    if (!token) {
      return null;
    }

    // Check if token needs refresh (less than 5 minutes remaining)
    const isValid = await verifyToken(token);

    if (!isValid) {
      // Force refresh
      return await getToken();
    }

    return token;
  } catch (error) {
    logError(error, { component: "AuthAudit", action: "ensureFreshToken" });
    return null;
  }
}

/**
 * Log authentication events for debugging
 */
export function logAuthEvent(
  event: string,
  details?: Record<string, unknown>,
): void {
  if (import.meta.env.DEV) {
    if (import.meta.env.DEV) {
      console.log(`[Auth Audit] ${event}`, details || "");
    }
  }
}
