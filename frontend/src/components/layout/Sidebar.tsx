import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, BarChart3, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn } from "@/lib/utils";

/**
 * Sidebar Component
 *
 * Redesigned navigation sidebar with:
 * - Logo and tagline at the top
 * - Navigation items with icons and labels
 * - Active state highlighting with background and icon color changes
 * - Hover effects on navigation items
 * - Notification badges on nav items
 * - Theme toggle at the bottom
 * - Responsive design (hidden on mobile, shown on desktop)
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  // Core navigation items as per design spec
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
      badge: unreadCount, // Show notification badge for unread messages
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
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo and Tagline */}
      <div className="p-6">
        <Link
          to="/app/feed"
          className="flex flex-col items-start gap-1 transition-opacity hover:opacity-80"
          aria-label="Quad - Go to feed">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-2xl font-bold text-foreground">Quad</span>
          </div>
          <span className="text-xs text-muted-foreground ml-10">
            Connect. Create.
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3" aria-label="Main navigation">
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
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  aria-current={isActive ? "page" : undefined}>
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary-foreground" : ""
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>

                  {/* Notification Badge */}
                  {hasBadge && (
                    <motion.span
                      className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      aria-label={`${item.badge} unread`}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <ThemeSelector />
      </div>
    </div>
  );
}
