import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";
import type { PermissionType } from "@/lib/security";
import { logAuthEvent } from "@/lib/authAudit";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: PermissionType[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  // Log authentication check
  useEffect(() => {
    if (isLoaded) {
      logAuthEvent("Protected route access attempt", {
        path: location.pathname,
        isSignedIn,
        requiredPermissions,
      });
    }
  }, [isLoaded, isSignedIn, location.pathname, requiredPermissions]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    logAuthEvent("Unauthenticated access blocked", {
      path: location.pathname,
      redirectTo,
    });

    // Preserve intended destination for redirect after login
    sessionStorage.setItem(
      "redirectAfterLogin",
      location.pathname + location.search
    );

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // TODO: Add permission checking when user roles are implemented
  // For now, all authenticated users have access
  if (requiredPermissions.length > 0) {
    // In a real implementation, you'd check user permissions here
    logAuthEvent("Permission check required", {
      path: location.pathname,
      requiredPermissions,
    });
    console.log(
      "Permission checking not implemented yet:",
      requiredPermissions
    );
  }

  logAuthEvent("Protected route access granted", {
    path: location.pathname,
  });

  return <>{children}</>;
}
