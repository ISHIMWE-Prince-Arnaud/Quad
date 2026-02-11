import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { MainAppSkeleton } from "@/components/ui/loading";

export function IndexRedirect() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <MainAppSkeleton />;
  }

  return <Navigate to={isSignedIn ? "/app/feed" : "/login"} replace />;
}
