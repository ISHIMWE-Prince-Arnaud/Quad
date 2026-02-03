import { Outlet } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useThemeStore } from "../stores/themeStore";
import { useAuthSync } from "../hooks/useAuthSync";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  getSocket,
  type NotificationPayload,
  type NotificationUnreadCountPayload,
} from "@/lib/socket";
import { useNotificationStore } from "@/stores/notificationStore";

export function RootLayout() {
  // Sync auth state with Clerk
  useAuthSync();
  const { user, isLoading } = useAuthStore();
  const joinedRef = useRef<string | null>(null);
  const { fetchUnreadCount, setUnreadCount } = useNotificationStore();

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

    if (isLoading || !userId) {
      return;
    }

    const joinRooms = () => {
      socket.emit("feed:join", userId);
      socket.emit("notification:join", userId);
    };

    // Join once for this user id (and re-join on reconnect)
    if (joinedRef.current !== userId) {
      joinRooms();
      joinedRef.current = userId;
    }

    socket.on("connect", joinRooms);

    // Initial unread count sync for this session
    void fetchUnreadCount();

    const handleNotificationNew = (payload: NotificationPayload) => {
      toast(payload.message, {
        position: "top-right",
      });
    };

    const handleUnreadCount = (payload: NotificationUnreadCountPayload) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on("notification:new", handleNotificationNew);
    socket.on("notification:unread_count", handleUnreadCount);

    return () => {
      socket.off("notification:new", handleNotificationNew);
      socket.off("notification:unread_count", handleUnreadCount);
      socket.off("connect", joinRooms);
      if (userId) {
        socket.emit("feed:leave", userId);
        socket.emit("notification:leave", userId);
      }
    };
  }, [isLoading, user?.clerkId, fetchUnreadCount, setUnreadCount]);

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
