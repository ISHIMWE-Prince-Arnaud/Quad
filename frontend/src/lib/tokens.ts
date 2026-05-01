import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef } from "react";
import { ensureFreshToken, logAuthEvent } from "./authAudit";
import { logError } from "./errorHandling";

// Hook for token management with enhanced security
export function useTokenManager() {
  const { getToken } = useAuth();
  const refreshIntervalRef = useRef<number | undefined>(undefined);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await ensureFreshToken(getToken);

      if (token) {
        logAuthEvent("Token retrieved successfully");
        // Token is NOT stored in localStorage for security
        // Retrieve fresh token from Clerk for each request
      } else {
        logAuthEvent("Token retrieval failed");
      }

      return token;
    } catch (error) {
      logError(error, { component: "TokenManager", action: "getAuthToken" });
      logAuthEvent("Token retrieval error", {
        error: (error as Error).message,
      });
      return null;
    }
  }, [getToken]);

  const getTokenWithClaims = useCallback(
    async (template?: string): Promise<string | null> => {
      try {
        const token = await getToken({ template });

        if (token) {
          logAuthEvent("Token with claims retrieved", { template });
        }

        return token;
      } catch (error) {
        logError(error, {
          component: "TokenManager",
          action: "getTokenWithClaims",
          metadata: { template },
        });
        logAuthEvent("Token with claims error", {
          template,
          error: (error as Error).message,
        });
        return null;
      }
    },
    [getToken]
  );

  // Periodic token refresh to ensure fresh tokens
  useEffect(() => {
    // Set up periodic token refresh (every 4 minutes)
    // This ensures tokens are fresh without storing them in localStorage
    refreshIntervalRef.current = window.setInterval(async () => {
      await getAuthToken();
      logAuthEvent("Periodic token refresh completed");
    }, 4 * 60 * 1000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [getAuthToken]);

  return {
    getAuthToken,
    getTokenWithClaims,
  };
}

// Hook for getting authenticated requests
export function useAuthenticatedRequest() {
  const { getToken } = useAuth();

  const getAuthHeaders = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      logError(error, { component: "TokenManager", action: "getAuthHeaders" });
      throw error;
    }
  };

  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    try {
      const headers = await getAuthHeaders();

      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
    } catch (error) {
      logError(error, {
        component: "TokenManager",
        action: "makeAuthenticatedRequest",
        metadata: { url },
      });
      throw error;
    }
  };

  return {
    getAuthHeaders,
    makeAuthenticatedRequest,
  };
}
