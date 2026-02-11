import { SignUp } from "@clerk/clerk-react";
import { useThemeStore } from "@/stores/themeStore";
import { getClerkAppearance } from "@/lib/clerkTheme";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function SignUpPage() {
  const { isDarkMode } = useThemeStore();

  return (
    <AuthSplitLayout variant="signup">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        appearance={getClerkAppearance(isDarkMode)}
      />
    </AuthSplitLayout>
  );
}
