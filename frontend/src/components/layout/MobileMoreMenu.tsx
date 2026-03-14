import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  PiDotsThreeOutlineBold,
  PiBellBold,
  PiUserBold,
  PiFileTextBold,
  PiChartBarBold,
  PiBookOpenTextBold,
  PiSunBold,
  PiMoonBold,
  PiSignOutBold,
} from "react-icons/pi";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { logError } from "@/lib/errorHandling";
import { showErrorToast } from "@/lib/error-handling/toasts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileMoreMenu() {
  const { signOut } = useAuth();
  const { user, logout } = useAuthStore();
  const { isDarkMode, setTheme } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      logout();
      await signOut();
    } catch (error) {
      logError(error, { component: "MobileMoreMenu", action: "signOut" });
      showErrorToast(error, "Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleQuickCreate = (type: "post" | "poll" | "story") => {
    if (type === "post") {
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.dispatchEvent(new CustomEvent("focus-post-composer"));
      } else {
        navigate("/?create=post");
      }
    } else {
      navigate(`/create/${type}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-150 text-muted-foreground hover:text-foreground active:scale-95"
          aria-label="More Menu"
        >
          <span className="relative">
            <PiDotsThreeOutlineBold className="h-[22px] w-[22px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-destructive px-0.5 text-[8px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </span>
          <span className="leading-none">More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-2 mb-4 rounded-2xl shadow-xl border-border/40 z-[100]"
        sideOffset={12}
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Navigation</span>
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => navigate("/notifications")} className="flex justify-between items-center">
          <div className="flex items-center">
            <PiBellBold className="mr-2 h-5 w-5" />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="h-5 min-w-[20px] flex items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
          <PiUserBold className="mr-2 h-5 w-5" />
          <span>View Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5 mt-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Create</span>
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => handleQuickCreate("post")}>
          <PiFileTextBold className="mr-2 h-5 w-5" />
          <span>New Post</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleQuickCreate("poll")}>
          <PiChartBarBold className="mr-2 h-5 w-5" />
          <span>New Poll</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleQuickCreate("story")}>
          <PiBookOpenTextBold className="mr-2 h-5 w-5" />
          <span>New Story</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
          {isDarkMode ? (
            <>
              <PiSunBold className="mr-2 h-5 w-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <PiMoonBold className="mr-2 h-5 w-5" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <PiSignOutBold className="mr-2 h-5 w-5" />
          <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
