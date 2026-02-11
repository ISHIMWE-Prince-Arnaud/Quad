import { SignIn } from "@clerk/clerk-react";
import { useThemeStore } from "@/stores/themeStore";
import { getClerkAppearance } from "@/lib/clerkTheme";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getIntendedDestination } from "@/lib/redirectAfterLogin";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function LoginPage() {
  const { isDarkMode } = useThemeStore();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  // Redirect to intended destination after successful login
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const destination = getIntendedDestination();
      navigate(destination, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <AuthSplitLayout variant="login">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        appearance={getClerkAppearance(isDarkMode)}
      />
    </AuthSplitLayout>
  );
}
