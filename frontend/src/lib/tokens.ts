import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

// Hook for token management
export function useTokenManager() {
  const { getToken } = useAuth();

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }, [getToken]);

  const getTokenWithClaims = useCallback(
    async (template?: string): Promise<string | null> => {
      try {
        return await getToken({ template });
      } catch (error) {
        console.error("Error getting token with claims:", error);
        return null;
      }
    },
    [getToken]
  );

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
      console.error("Error getting auth headers:", error);
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
      console.error("Error making authenticated request:", error);
      throw error;
    }
  };

  return {
    getAuthHeaders,
    makeAuthenticatedRequest,
  };
}
