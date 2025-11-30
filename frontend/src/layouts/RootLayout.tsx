import { Outlet } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useThemeStore } from "../stores/themeStore";
import { useAuthSync } from "../hooks/useAuthSync";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getSocket, type NotificationPayload } from "@/lib/socket";
import { useNotificationStore } from "@/stores/notificationStore";

export function RootLayout() {
  // Sync auth state with Clerk
  useAuthSync();
  const { user } = useAuthStore();
  const joinedRef = useRef<string | null>(null);
  const { fetchUnreadCount, incrementUnread } = useNotificationStore();

  // Initialize theme system
  const { initializeTheme, applyTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
    applyTheme();
  }, [initializeTheme, applyTheme]);

  // Socket feed + notifications join/leave and listeners
  useEffect(() => {
    const socket = getSocket();
    const userId = user?.clerkId;

    if (!userId) {
      return;
    }

    if (joinedRef.current !== userId) {
      socket.emit("feed:join", userId);
      socket.emit("notification:join", userId);
      joinedRef.current = userId;
    }

    // Initial unread count sync for this session
    void fetchUnreadCount();

    const handleNotificationNew = (payload: NotificationPayload) => {
      // Optimistically bump unread count, then reconcile via REST
      incrementUnread(1);
      void fetchUnreadCount();

      toast(payload.message, {
        position: "top-right",
      });
    };

    socket.on("notification:new", handleNotificationNew);

    return () => {
      socket.off("notification:new", handleNotificationNew);
      if (userId) {
        socket.emit("feed:leave", userId);
        socket.emit("notification:leave", userId);
      }
    };
  }, [user?.clerkId, fetchUnreadCount, incrementUnread]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card text-card-foreground border border-border",
          duration: 4000,
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        }}
      />

      {/* ARIA Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-region"
      />
    </div>
  );
}
