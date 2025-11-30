import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/authStore";
import { useTokenManager } from "@/lib/tokens";
import { ProfileService } from "@/services/profileService";
import { logAuthEvent, clearAuthData } from "@/lib/authAudit";

// Custom hook to sync Clerk user with our auth store
export function useAuthSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const { syncWithClerk, setLoading, logout } = useAuthStore();
  const { getAuthToken } = useTokenManager();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    let isMounted = true;

    const syncTokenAndProfile = async () => {
      try {
        // If user is signed out, clear all auth data
        if (!clerkUser) {
          logAuthEvent("User signed out, clearing auth data");
          clearAuthData();
          logout();
          setLoading(false);
          return;
        }

        // Get fresh token
        const token = await getAuthToken();

        if (!token) {
          logAuthEvent("Failed to get token for signed-in user");
          // Don't clear auth data yet, might be temporary issue
        } else {
          logAuthEvent("Token synced successfully", { userId: clerkUser.id });
        }

        // Eagerly sync current user profile in backend via Clerk ID
        try {
          if (clerkUser?.id) {
            await ProfileService.getProfileById(clerkUser.id);
            logAuthEvent("Profile synced successfully", {
              userId: clerkUser.id,
            });
          }
        } catch (syncError) {
          console.error("Failed to sync profile on login", syncError);
          logAuthEvent("Profile sync failed", {
            userId: clerkUser.id,
            error: (syncError as Error).message,
          });
        }

        if (!isMounted) {
          return;
        }

        syncWithClerk(clerkUser);
        setLoading(false);
      } catch (error) {
        console.error("Auth sync error:", error);
        logAuthEvent("Auth sync error", { error: (error as Error).message });

        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncTokenAndProfile();

    return () => {
      isMounted = false;
    };
  }, [clerkUser, getAuthToken, isLoaded, setLoading, syncWithClerk, logout]);

  return { isLoaded };
}
