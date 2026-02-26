import { useNavigate } from "react-router-dom";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {
  getIntendedDestination,
  peekIntendedDestination,
} from "@/lib/redirectAfterLogin";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        redirectUrl: "/login/sso-callback",
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
      <div className="space-y-8 max-w-sm mx-auto">
        <div className="flex flex-col items-center text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Sign in to{" "}
            <span className="bg-gradient-to-r from-primary via-[#60a5fa] to-primary bg-clip-text text-transparent italic drop-shadow-sm">
              Quad
            </span>
          </h2>
          <p className="text-[13px] text-muted-foreground/60 font-medium max-w-[240px]">
            Welcome back. Continue where the pulse left off.
          </p>
        </div>

        {!isSignInLoaded && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isSignInLoaded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-2xl border-destructive/20 bg-destructive/5 px-4 py-3">
                <AlertDescription className="text-xs font-semibold leading-normal">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-full border-border/40 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 font-bold text-sm shadow-sm group"
                onClick={handleGoogleSignIn}
                loading={submitting}
                disabled={submitting}>
                <FcGoogle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Continue with Google
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full opacity-40" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground">
                    OR
                  </span>
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
                      className="p-1.5 text-muted-foreground/50 hover:text-primary transition-colors"
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
                  className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                  loading={submitting}
                  disabled={!canSubmit}>
                  Sign In
                </Button>
              </form>
            </div>

            <div className="text-center pt-2">
              <p className="text-[13px] text-muted-foreground font-medium">
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="font-black text-primary hover:underline underline-offset-4 decoration-2"
                  onClick={() => navigate("/signup")}
                  disabled={submitting}>
                  Create account
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}
