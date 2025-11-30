/**
 * React hook for CSRF protection
 */

import { useEffect, useState } from "react";
import {
  initializeCSRFProtection,
  refreshCSRFToken,
  getCSRFToken,
} from "@/lib/csrfProtection";

export function useCSRFProtection() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await initializeCSRFProtection();
      const currentToken = getCSRFToken();
      setToken(currentToken);
      setIsInitialized(true);
    };

    initialize();
  }, []);

  const refresh = async () => {
    const newToken = await refreshCSRFToken();
    setToken(newToken);
    return newToken;
  };

  return {
    isInitialized,
    token,
    refresh,
  };
}
