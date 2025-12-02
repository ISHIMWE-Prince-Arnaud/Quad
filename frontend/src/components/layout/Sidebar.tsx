import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Search,
  Bell,
  MessageCircle,
  BarChart3,
  Calendar,
  User,
  Plus,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { LogoWithText } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navigationItems: NavItem[] = [
    { name: "Home", href: "/app/feed", icon: Home },
    { name: "Search", href: "/app/search", icon: Search },
    { name: "Notifications", href: "/app/notifications", icon: Bell },
    { name: "Messages", href: "/app/chat", icon: MessageCircle },
    { name: "Stories", href: "/app/stories", icon: Calendar },
    { name: "Polls", href: "/app/polls", icon: BarChart3 },
    { name: "Analytics", href: "/app/analytics", icon: TrendingUp },
    ...(user?.username
      ? [
          {
            name: "Profile",
            href: `/app/profile/${user.username}`,
            icon: User,
          },
        ]
      : [])
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-border bg-background"
        // Optional subtle glass style:
        // "backdrop-blur-md bg-background/70"
      )}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border/60">
        <Link to="/app/feed">
          <LogoWithText className="hover:opacity-80 transition opacity-90" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 space-y-1" aria-label="Sidebar">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Create Post */}
      <div className="px-3 mt-2 mb-4">
        <Link
          to="/app/create"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-md text-sm font-medium transition bg-primary text-white hover:bg-primary/90 shadow-sm">
          <Plus className="w-5 h-5" />
          Create
        </Link>
      </div>

      {/* Profile & Logout */}
      <div className="border-t border-border/70 px-3 py-4 space-y-3">
        <Link
          to={user?.username ? `/app/profile/${user.username}` : "#"}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition">
          <UserAvatar />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.firstName || user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.username || "username"}
            </p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
