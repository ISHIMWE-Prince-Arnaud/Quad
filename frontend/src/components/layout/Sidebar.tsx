import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Bell,
  MessageCircle,
  BarChart3,
  Calendar,
  User,
  Settings,
  Plus,
  TrendingUp,
} from "lucide-react";
import { LogoWithText } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { AdvancedThemeSelector } from "@/components/theme/ThemeSelector";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  // Generate navigation items with dynamic profile link
  const getNavigationItems = () => {
    const items = [
      { name: "Home", href: "/app/feed", icon: Home },
      { name: "Search", href: "/app/search", icon: Search },
      { name: "Notifications", href: "/app/notifications", icon: Bell },
      { name: "Messages", href: "/app/chat", icon: MessageCircle },
      { name: "Stories", href: "/app/stories", icon: Calendar },
      { name: "Polls", href: "/app/polls", icon: BarChart3 },
      { name: "Analytics", href: "/app/analytics", icon: TrendingUp },
      { name: "Settings", href: "/app/settings", icon: Settings },
    ];

    // Add profile link if user exists
    if (user?.username) {
      items.splice(7, 0, {
        name: "Profile",
        href: `/app/profile/${user.username}`,
        icon: User,
      });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link to="/app/feed" className="flex items-center">
          <LogoWithText className="transition-opacity hover:opacity-80" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  aria-current={isActive ? "page" : undefined}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Create Post Button */}
      <div className="px-3 py-4">
        <Link
          to="/app/create"
          className="inline-flex items-center justify-center gap-3 w-full h-12 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200">
          <Plus className="h-5 w-5" />
          Create Post
        </Link>
      </div>

      {/* Theme Selector */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Theme
          </span>
        </div>
        <AdvancedThemeSelector />
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors duration-200 cursor-pointer">
          <UserAvatar />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName || user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.username || "username"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
