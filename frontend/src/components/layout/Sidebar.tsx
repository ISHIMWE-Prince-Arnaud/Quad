import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Rss,
  MessageSquare,
  BookOpen,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { LogoWithText } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/auth/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { logError } from "@/lib/errorHandling";

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
      logError(error, { component: "Sidebar", action: "signOut" });
    }
  };

  const navigationItems: NavItem[] = [
    { name: "Feed", href: "/app/feed", icon: Rss },
    { name: "Chat", href: "/app/chat", icon: MessageSquare },
    { name: "Stories", href: "/app/stories", icon: BookOpen },
    { name: "Polls", href: "/app/polls", icon: BarChart3 },
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

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0a0c10] border-r border-border/10"
      )}>
      {/* 1. Logo - Improved branding */}
      <div className="px-8 pt-8 pb-10">
        <Link to="/app/feed" aria-label="Go to Home">
          <LogoWithText className="hover:opacity-90 transition" />
        </Link>
      </div>

      {/* 2. Navigation - Refined styling matching design */}
      <nav className="flex-1 px-4 space-y-2" aria-label="Sidebar navigation">
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all group",
                isActive
                  ? "bg-[#2563eb] text-white shadow-[0_8px_16px_rgba(37,99,235,0.2)]"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
              )}>
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-[#64748b] group-hover:text-white"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section: Theme Toggle & Profile */}
      <div className="px-4 pb-8 space-y-6">
        {/* Profile & Logout */}
        <div className="flex items-center justify-between">
          <Link
            to={user?.username ? `/app/profile/${user.username}` : "#"}
            className="flex items-center gap-3 group">
            <UserAvatar className="w-10 h-10 border-2 border-transparent group-hover:border-[#2563eb] transition-all" />
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-white truncate">
                {user?.username || "Guest"}
              </p>
              <p className="text-[10px] text-[#64748b] font-medium">
                View Profile
              </p>
            </div>
          </Link>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-2 text-[#64748b] hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                <LogOut className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f121a] border-border/10 text-white">
              <DialogHeader>
                <DialogTitle>Log Out</DialogTitle>
                <DialogDescription className="text-[#64748b]">
                  Are you sure you want to log out of Quad?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-[#64748b] hover:text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="bg-destructive hover:bg-destructive/90">
                  Log Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
