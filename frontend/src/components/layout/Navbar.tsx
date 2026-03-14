import { Link, useNavigate } from "react-router-dom";
import { LogoWithText } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";
import { PiBellBold } from "react-icons/pi";
import { useNotificationStore } from "@/stores/notificationStore";

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
  const navigate = useNavigate();

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
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
              aria-label="Notifications"
            >
              <PiBellBold className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar - Direct Link to Profile */}
            <UserAvatar className="h-9 w-9 border border-border/40" />
          </div>
        </div>
      </header>
    </>
  );
}
