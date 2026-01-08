import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { getClerkAppearance } from "@/lib/clerkTheme";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/errorHandling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, logout } = useAuthStore();
  const { isDarkMode } = useThemeStore();

  const handleSignOut = async () => {
    try {
      logout();
      await signOut();
    } catch (error) {
      logError(error, { component: "UserMenu", action: "signOut" });
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
            className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Clerk User Button (Production ready) */}
      <UserButton appearance={getClerkAppearance(isDarkMode)} showName />
    </div>
  );
}

// Simplified version for navigation
export function UserAvatar() {
  const { user } = useAuthStore();

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || "User";

  return (
    <Avatar className="h-10 w-10">
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
}
