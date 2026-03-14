import { Link } from "react-router-dom";
import { LogoWithText } from "@/components/ui/Logo";
import { UserNavMenu } from "@/components/auth/UserMenu";
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

            {/* User Avatar with Menu */}
            <UserNavMenu />
          </div>
        </div>
      </header>
    </>
  );
}
