import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/authStore";
import { useTokenManager } from "@/lib/tokens";

// Custom hook to sync Clerk user with our auth store
export function useAuthSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const { syncWithClerk, setLoading } = useAuthStore();
  const { getAuthToken } = useTokenManager();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    (async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          localStorage.setItem("clerk-db-jwt", token);
        } else {
          localStorage.removeItem("clerk-db-jwt");
        }
      } catch {
        localStorage.removeItem("clerk-db-jwt");
      }

      syncWithClerk(clerkUser);
      setLoading(false);
    })();
  }, [clerkUser, getAuthToken, isLoaded, setLoading, syncWithClerk]);

  return { isLoaded };
}
