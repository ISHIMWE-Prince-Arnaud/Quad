import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  MessagesSquare,
  BookOpen,
  BarChart3,
  User,
  Bell,
} from "lucide-react";
import { LogoWithText } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const navigationItems: NavItem[] = [
    { name: "Feed", href: "/app/feed", icon: Home },
    { name: "Polls", href: "/app/polls", icon: BarChart3 },
    { name: "Stories", href: "/app/stories", icon: BookOpen },
    { name: "Chat", href: "/app/chat", icon: MessagesSquare },
    {
      name: "Notifications",
      href: "/app/notifications",
      icon: Bell,
      badge: unreadCount,
    },
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
        "flex flex-col h-full bg-sidebar border-r border-border/40",
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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                isActive
                  ? "text-foreground bg-primary/10 border border-primary/20 shadow-sm before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:h-7 before:w-1 before:rounded-full before:bg-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent",
              )}>
              <span
                className={cn(
                  "h-9 w-9 rounded-xl grid place-items-center transition-all",
                  isActive
                    ? "bg-primary/15"
                    : "bg-foreground/[0.03] group-hover:bg-foreground/[0.06]",
                )}>
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
              </span>
              <span>{item.name}</span>
              {!!item.badge && item.badge > 0 && (
                <span
                  className="ml-auto inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-destructive px-2 text-[11px] font-semibold text-destructive-foreground"
                  aria-label={`${item.badge} unread`}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
