import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  MessagesSquare,
  BookOpen,
  BarChart3,
  User,
  Plus,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { LogoWithText } from "@/components/ui/Logo";
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
    { name: "Feed", href: "/app/feed", icon: Home },
    { name: "Chat", href: "/app/chat", icon: MessagesSquare },
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
      <nav
        className="flex-1 px-4 space-y-1 overflow-y-auto overscroll-contain pb-6"
        aria-label="Sidebar navigation">
        {navigationItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              title={item.name}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all group",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c10]",
                isActive
                  ? "text-white bg-[#2563eb]/15 border border-[#2563eb]/25 shadow-[0_10px_20px_rgba(37,99,235,0.10)] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:rounded-full before:bg-[#2563eb]"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-white border border-transparent"
              )}>
              <span
                className={cn(
                  "h-9 w-9 rounded-xl grid place-items-center transition-all",
                  isActive
                    ? "bg-[#2563eb]/20"
                    : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                )}>
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-[#3b82f6]"
                      : "text-[#64748b] group-hover:text-white"
                  )}
                />
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-8 pt-6 space-y-3 border-t border-white/5">
        <Button
          asChild
          className="w-full rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]">
          <Link to="/app/create" aria-label="Create">
            <Plus className="h-5 w-5" />
            Create
          </Link>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-2xl justify-start text-destructive/90 hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f121a] border-border/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Log Out
              </DialogTitle>
              <DialogDescription className="text-[#64748b]">
                This will end your session on this device. You will need to sign in again to continue.
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
  );
}
