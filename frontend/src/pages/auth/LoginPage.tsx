import { SignIn } from "@clerk/clerk-react";
import { useThemeStore } from "@/stores/themeStore";
import { getClerkAppearance } from "@/lib/clerkTheme";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getIntendedDestination } from "@/lib/redirectAfterLogin";

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
    <div className="flex items-center justify-center min-h-[90vh] px-4">
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          appearance={getClerkAppearance(isDarkMode)}
        />
      </div>
    </div>
  );
}
