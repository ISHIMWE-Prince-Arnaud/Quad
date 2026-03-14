import { useState } from "react";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { getClerkAppearance } from "@/lib/clerkTheme";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/errorHandling";
import { showErrorToast } from "@/lib/error-handling/toasts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PiChartBarBold,
  PiBookOpenTextBold,
  PiSunBold,
  PiMoonBold,
  PiSignOutBold,
  PiFileTextBold,
  PiUserBold,
} from "react-icons/pi";
import { useNavigate } from "react-router-dom";

export function UserMenu() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, logout } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      logout();
      await signOut();
    } catch (error) {
      logError(error, { component: "UserMenu", action: "signOut" });
      showErrorToast(error, "Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!clerkUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* User Info Card (for development/debugging) */}
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm">User Profile</CardTitle>
          <CardDescription>
            {user?.firstName} {user?.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Username:</strong> {user?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Verified:</strong> {user?.isVerified ? "Yes" : "No"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            loading={isSigningOut}
            disabled={isSigningOut}
            className="w-full">
            {isSigningOut ? "Logging out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>

      {/* Clerk User Button (Production ready) */}
      <UserButton appearance={getClerkAppearance(isDarkMode)} showName />
    </div>
  );
}

// Simplified version for navigation
export function UserAvatar({
  className,
  noLink = false,
}: {
  className?: string;
  noLink?: boolean;
}) {
  const { user } = useAuthStore();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "User";

  const content = (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage
        src={user?.profileImage}
        alt={displayName}
        className="object-cover"
      />
      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  if (user?.username && !noLink) {
    return (
      <Link
        to={`/profile/${user.username}`}
        className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export function UserNavMenu() {
  const { signOut } = useAuth();
  const { logout } = useAuthStore();
  const { isDarkMode, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      logout();
      await signOut();
    } catch (error) {
      logError(error, { component: "UserNavMenu", action: "signOut" });
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
        <button className="focus:outline-none rounded-full overflow-hidden">
          <UserAvatar
            noLink
            className="h-9 w-9 border border-border/40"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl border-border/40">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</span>
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={() => navigate(`/profile/${useAuthStore.getState().user?.username}`)}>
          <PiUserBold className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5 mt-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Create</span>
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => handleQuickCreate("post")}>
          <PiFileTextBold className="mr-2 h-4 w-4" />
          <span>New Post</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleQuickCreate("poll")}>
          <PiChartBarBold className="mr-2 h-4 w-4" />
          <span>New Poll</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleQuickCreate("story")}>
          <PiBookOpenTextBold className="mr-2 h-4 w-4" />
          <span>New Story</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
          {isDarkMode ? (
            <>
              <PiSunBold className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <PiMoonBold className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <PiSignOutBold className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
