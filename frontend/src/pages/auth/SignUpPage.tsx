import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PulsingLogoSpinner from "@/components/ui/PulsingLogoSpinner";
import {
  getIntendedDestination,
  peekIntendedDestination,
} from "@/lib/redirectAfterLogin";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    code: false,
  });

  const oauthRedirectComplete = useMemo(() => {
    const destination = peekIntendedDestination();
    return `${window.location.origin}${destination}`;
  }, []);

  const handleGoogleSignUp = async () => {
    setError(null);
    if (!isLoaded || !signUp) return;
    setSubmitting(true);
    try {
      await signUp.authenticateWithRedirect({
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

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLoaded || !signUp) return;

    setTouched((t) => ({ ...t, username: true, email: true, password: true }));
    if (
      username.trim().length === 0 ||
      email.trim().length === 0 ||
      password.length === 0
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await signUp.create({
        username: username.trim(),
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? ((err as { errors?: { message?: string }[] }).errors?.[0]
              ?.message ?? "Unable to create account.")
          : "Unable to create account.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isLoaded || !signUp) return;

    setTouched((t) => ({ ...t, code: true }));
    if (code.trim().length === 0) return;

    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const destination = getIntendedDestination();
        navigate(destination, { replace: true });
        return;
      }

      setError("Verification requires additional steps. Please try again.");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "errors" in err
          ? ((err as { errors?: { message?: string }[] }).errors?.[0]
              ?.message ?? "Invalid verification code.")
          : "Invalid verification code.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout variant="signup">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <Logo size="md" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Join Quad and start moving in real time.
          </p>
        </div>

        {!isLoaded && (
          <div className="py-6">
            <PulsingLogoSpinner />
          </div>
        )}

        {isLoaded && (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                    loading={submitting}
                    disabled={submitting}>
                    Continue with Google
                  </Button>

                  <div className="relative py-1">
                    <Separator />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                      or
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleCreateAccount}>
                    <Input
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      disabled={submitting}
                      error={
                        touched.username && username.trim().length === 0
                          ? "Choose a username"
                          : undefined
                      }
                      onBlur={() =>
                        setTouched((t) => ({ ...t, username: true }))
                      }
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={submitting}
                      error={
                        touched.email && email.trim().length === 0
                          ? "Enter your email"
                          : undefined
                      }
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    />
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={submitting}
                      error={
                        touched.password && password.length === 0
                          ? "Create a password"
                          : undefined
                      }
                      onBlur={() =>
                        setTouched((t) => ({ ...t, password: true }))
                      }
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
                      disabled={
                        submitting ||
                        username.trim().length === 0 ||
                        email.trim().length === 0 ||
                        password.length === 0
                      }>
                      Continue
                    </Button>
                  </form>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-medium text-primary hover:text-primary/80"
                      onClick={() => navigate("/login")}
                      disabled={submitting}>
                      Sign in
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4">
                  <div className="rounded-lg border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    We sent a verification code to{" "}
                    <span className="font-medium text-foreground">
                      {email.trim()}
                    </span>
                    .
                  </div>

                  <form className="space-y-4" onSubmit={handleVerifyCode}>
                    <Input
                      label="Verification code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      disabled={submitting}
                      maxLength={6}
                      error={
                        touched.code && code.trim().length === 0
                          ? "Enter the 6-digit code"
                          : undefined
                      }
                      onBlur={() => setTouched((t) => ({ ...t, code: true }))}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      loading={submitting}
                      disabled={submitting || code.trim().length === 0}>
                      Verify & finish
                    </Button>
                  </form>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <button
                      type="button"
                      className="font-medium text-primary hover:text-primary/80"
                      onClick={() => setStep("form")}
                      disabled={submitting}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="font-medium text-primary hover:text-primary/80"
                      onClick={async () => {
                        if (!signUp) return;
                        setSubmitting(true);
                        setError(null);
                        try {
                          await signUp.prepareEmailAddressVerification({
                            strategy: "email_code",
                          });
                        } catch (err: unknown) {
                          const message =
                            typeof err === "object" && err && "errors" in err
                              ? ((err as { errors?: { message?: string }[] })
                                  .errors?.[0]?.message ??
                                "Unable to resend code.")
                              : "Unable to resend code.";
                          setError(message);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      disabled={submitting}>
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
