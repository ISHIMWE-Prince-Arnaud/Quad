import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "../stores/themeStore";
import { useAuthSync } from "../hooks/useAuthSync";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";

export function RootLayout() {
  // Sync auth state with Clerk
  useAuthSync();
  const { user } = useAuthStore();
  const joinedRef = useRef<string | null>(null);

  // Initialize theme system
  const { initializeTheme, applyTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
    applyTheme();
  }, [initializeTheme, applyTheme]);

  // Socket feed join/leave
  useEffect(() => {
    const socket = getSocket();
    const userId = user?.clerkId;

    if (userId && joinedRef.current !== userId) {
      socket.emit("feed:join", userId);
      joinedRef.current = userId;
    }

    return () => {
      if (userId) {
        socket.emit("feed:leave", userId);
      }
    };
  }, [user?.clerkId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card text-card-foreground border border-border",
          duration: 4000,
        }}
      />
    </div>
  );
}
