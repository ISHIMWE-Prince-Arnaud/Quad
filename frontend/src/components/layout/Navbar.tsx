import { Link } from "react-router-dom";
import { PiBellBold } from "react-icons/pi";
import { LogoWithText } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";

/**
 * Navbar Component
 *
 * Slim mobile header bar (visible on < lg screens).
 * Primary mobile navigation is handled by the bottom tab bar in MainLayout.
 * Contains: logo, notification bell, user avatar.
 *
 * Validates: Requirements 9.5, 11.1
 */
export function Navbar() {
  const { unreadCount } = useNotificationStore();

  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsDialog />
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <LogoWithText size="sm" />
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Notifications"
              aria-label={`Notifications${
                unreadCount > 0 ? ` (${unreadCount} unread)` : ""
              }`}>
              <PiBellBold className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 inline-flex min-w-[1rem] h-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
                  aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Avatar */}
            <UserAvatar />
          </div>
        </div>
      </header>
    </>
  );
}
