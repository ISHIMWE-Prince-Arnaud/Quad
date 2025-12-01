import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, Bell } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const { unreadCount } = useNotificationStore();

  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsDialog />
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Logo */}
          <Link to="/app/feed" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Center: Global Search (hidden on small screens) */}
          <div className="hidden sm:block flex-1 max-w-sm mx-4">
            <GlobalSearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Create Post Button */}
            <Link
              to="/app/create"
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Create Post"
              aria-label="Create new post (Shortcut: N)">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </Link>

            {/* Notifications */}
            <Link
              to="/app/notifications"
              className="relative p-2 rounded-lg hover:bg-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Notifications"
              aria-label={`Notifications${
                unreadCount > 0 ? ` (${unreadCount} unread)` : ""
              } (Shortcut: B)`}>
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 inline-flex min-w-[1rem] h-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground"
                  aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Avatar */}
            <UserAvatar />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 lg:hidden"
              aria-label="Toggle mobile menu">
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-50 bg-background border-b border-border transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}>
        <nav className="p-4">
          {/* Search Bar */}
          <div className="mb-4">
            <GlobalSearchBar />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Link
              to="/app/create"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              onClick={toggleMobileMenu}>
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Create</span>
            </Link>
            <Link
              to="/app/notifications"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors duration-200"
              onClick={toggleMobileMenu}>
              <span className="text-sm font-medium">Notifications</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
