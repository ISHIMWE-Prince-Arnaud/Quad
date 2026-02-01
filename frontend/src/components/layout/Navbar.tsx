import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  Home,
  MessageCircle,
  BarChart3,
  BookOpen,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";

/**
 * Navbar Component
 *
 * Mobile navigation with hamburger menu that reveals sidebar navigation.
 * Includes notification badges and theme toggle.
 *
 * Validates: Requirements 9.5, 11.1
 */
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();

  // Core navigation items matching sidebar
  const navigationItems = [
    {
      name: "Feed",
      href: "/app/feed",
      icon: Home,
      badge: 0,
    },
    {
      name: "Chat",
      href: "/app/chat",
      icon: MessageCircle,
      badge: unreadCount,
    },
    {
      name: "Stories",
      href: "/app/stories",
      icon: BookOpen,
      badge: 0,
    },
    {
      name: "Polls",
      href: "/app/polls",
      icon: BarChart3,
      badge: 0,
    },
    {
      name: "Profile",
      href: user?.username ? `/app/profile/${user.username}` : "/app/profile",
      icon: User,
      badge: 0,
    },
  ];

  return (
    <>
      <KeyboardShortcutsDialog />
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Logo */}
          <Link to="/app/feed" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold text-foreground">Quad</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
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

            {/* User Avatar */}
            <UserAvatar />

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200 lg:hidden"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}>
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={toggleMobileMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu - Sidebar Style */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed top-16 left-0 bottom-0 z-50 w-64 bg-card border-r border-border lg:hidden overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            {/* Navigation Items */}
            <nav className="p-3" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/app/feed" &&
                      location.pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const hasBadge = item.badge > 0;

                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={toggleMobileMenu}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        )}
                        aria-current={isActive ? "page" : undefined}>
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-colors duration-200",
                            isActive ? "text-primary-foreground" : "",
                          )}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>

                        {/* Notification Badge */}
                        {hasBadge && (
                          <span
                            className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center"
                            aria-label={`${item.badge} unread`}>
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-border mt-4">
              <ThemeSelector />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
