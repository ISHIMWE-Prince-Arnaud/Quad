import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/authStore";
import { useTokenManager } from "@/lib/tokens";
import { ProfileService } from "@/services/profileService";

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

      // Eagerly sync current user profile in backend via Clerk ID
      try {
        if (clerkUser?.id) {
          await ProfileService.getProfileById(clerkUser.id);
        }
      } catch (syncError) {
        console.error("Failed to sync profile on login", syncError);
      }

      syncWithClerk(clerkUser);
      setLoading(false);
    })();
  }, [clerkUser, getAuthToken, isLoaded, setLoading, syncWithClerk]);

  return { isLoaded };
}
