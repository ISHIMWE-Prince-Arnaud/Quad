import { useState } from "react";
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

// Assuming these UI components exist in your project structure
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { signOut } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      await signOut();
      setIsDialogOpen(false);
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
      : []),
  ];

  const currentUsername = user?.username || "Guest";

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-border bg-background"
      )}>
      {/* 1. Logo - Improved border and padding */}
      <div className="px-6 pt-5 pb-4 border-b border-border/80">
        <Link to="/app/feed" aria-label="Go to Home">
          {/* Ensure LogoWithText has a consistent size */}
          <LogoWithText className="w-auto h-8 hover:opacity-90 transition" />
        </Link>
      </div>

      {/* 2. Navigation - Improved spacing and active state */}
      <nav
        className="flex-1 px-3 pt-5 space-y-1"
        aria-label="Sidebar navigation">
        {navigationItems.map((item) => {
          // Use location.pathname.startsWith for partial matching (e.g., /app/profile/user-x)
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-all group",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
              )}>
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Create Post - Elevated Button for Primary CTA */}
      <div className="px-3 mt-4 mb-6">
        <Button
          asChild
          className="flex items-center justify-center gap-2 w-full h-11 text-base shadow-lg hover:shadow-xl transition-all">
          <Link to="/app/create">
            <Plus className="w-5 h-5" />
            Create Post
          </Link>
        </Button>
      </div>

      {/* 4. Profile & Logout - Improved separation and logout style */}
      <div className="border-t border-border/70 px-3 py-4 space-y-2">
        {/* Profile Link */}
        <Link
          to={user?.username ? `/app/profile/${user.username}` : "#"}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition -mx-1">
          <UserAvatar />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                user?.username ||
                "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{currentUsername}
            </p>
          </div>
        </Link>

        {/* 5. Log Out Button & Dialog - Applied previous UI improvement */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition",
                "mt-2", // Add top margin for separation from profile link
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-background"
              )}>
              <LogOut className="h-5 w-5 shrink-0" />
              Log Out
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-col items-center pt-2">
              <div className="p-3 mb-2 rounded-full bg-destructive/10 text-destructive">
                <LogOut className="h-8 w-8" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Log Out of Account
              </DialogTitle>
              <DialogDescription className="text-center">
                You are about to log out **@{currentUsername}**. Are you sure
                you want to proceed?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto order-1 sm:order-2">
                <LogOut className="h-4 w-4 mr-2" />
                Yes, Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
