import { useNavigate } from "react-router-dom";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { Eye, EyeOff } from "lucide-react";
import {
  getIntendedDestination,
  peekIntendedDestination,
} from "@/lib/redirectAfterLogin";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PulsingLogoSpinner from "@/components/ui/PulsingLogoSpinner";

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
  });

  const oauthRedirectComplete = useMemo(() => {
    const destination = peekIntendedDestination();
    return `${window.location.origin}${destination}`;
  }, []);

  // Redirect to intended destination after successful login
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const destination = getIntendedDestination();
      navigate(destination, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  const identifierError =
    touched.identifier && identifier.trim().length === 0
      ? "Enter your email or username"
      : undefined;

  const passwordError =
    touched.password && password.length === 0
      ? "Enter your password"
      : undefined;

  const canSubmit =
    identifier.trim().length > 0 && password.length > 0 && !submitting;

  const handlePasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSignInLoaded || !signIn) return;

    setTouched({ identifier: true, password: true });
    if (identifier.trim().length === 0 || password.length === 0) return;

    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const destination = getIntendedDestination();
        navigate(destination, { replace: true });
        return;
      }

      setError("Sign in requires additional steps. Please try again.");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? ((err as { errors?: { message?: string }[] }).errors?.[0]
              ?.message ?? "Unable to sign in.")
          : "Unable to sign in.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!isSignInLoaded || !signIn) return;

    setSubmitting(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: oauthRedirectComplete,
      });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? ((err as { errors?: { message?: string }[] }).errors?.[0]
              ?.message ?? "Unable to continue with Google.")
          : "Unable to continue with Google.";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout variant="login">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <Logo size="md" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Sign in to Quad
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Continue where the pulse left off.
          </p>
        </div>

        {!isSignInLoaded && (
          <div className="py-6">
            <PulsingLogoSpinner />
          </div>
        )}

        {isSignInLoaded && (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              loading={submitting}
              disabled={submitting}>
              Continue with Google
            </Button>

            <div className="relative py-2">
              <Separator />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </div>
            </div>

            <form className="space-y-4" onSubmit={handlePasswordSignIn}>
              <Input
                label="Email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                disabled={submitting}
                error={identifierError}
                onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={submitting}
                error={passwordError}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                rightElement={
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={submitting}>
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              <Button
                type="submit"
                className="w-full"
                loading={submitting}
                disabled={!canSubmit}>
                Continue
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Use your email or username to sign in.
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:text-primary/80"
                onClick={() => navigate("/signup")}
                disabled={submitting}>
                Sign up
              </button>
            </div>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
