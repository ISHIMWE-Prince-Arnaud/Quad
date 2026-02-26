import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SegmentedOTP } from "@/components/auth/SegmentedOTP";
import {
  getIntendedDestination,
  peekIntendedDestination,
} from "@/lib/redirectAfterLogin";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
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

  // Username availability check
  useEffect(() => {
    const checkAvailability = async () => {
      if (username.trim().length < 3) {
        setUsernameAvailable(null);
        return;
      }
      setCheckingUsername(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
        const res = await fetch(`${baseUrl}/users/check/${username.trim()}`);
        const data = await res.json();
        if (data.success) {
          setUsernameAvailable(data.available);
        }
      } catch (err) {
        console.error("Failed to check username availability", err);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleGoogleSignUp = async () => {
    setError(null);
    if (!isLoaded || !signUp) return;
    setSubmitting(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/signup/sso-callback",
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
      password.length === 0 ||
      usernameAvailable === false
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
      <div className="space-y-8 max-w-sm mx-auto">
        {/* Breadcrumbs / Step Indicator */}
        <div className="flex justify-center items-center gap-2 px-10">
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              step === "form" ? "bg-primary" : "bg-primary/20",
            )}
          />
          <div
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              step === "verify" ? "bg-primary" : "bg-muted/30",
            )}
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            {step === "form" ? (
              <>
                Create your{" "}
                <span className="bg-gradient-to-r from-primary via-[#60a5fa] to-primary bg-clip-text text-transparent italic drop-shadow-sm">
                  account
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-primary via-[#60a5fa] to-primary bg-clip-text text-transparent drop-shadow-sm">
                Verify your email
              </span>
            )}
          </h2>
          <p className="text-[13px] text-muted-foreground/60 font-medium max-w-[260px]">
            {step === "form" ? (
              "Join Quad and start moving in real time."
            ) : (
              <>
                We sent a code to{" "}
                <span className="text-primary font-bold">{email}</span>
              </>
            )}
          </p>
        </div>

        {!isLoaded && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isLoaded && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-2xl mb-6 border-destructive/20 bg-destructive/5 px-4 py-3">
                <AlertDescription className="text-xs font-semibold leading-normal">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-full border-border/40 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 font-bold text-sm shadow-sm group"
                      onClick={handleGoogleSignUp}
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
                        rightElement={
                          username.trim().length >= 3 && (
                            <div className="p-2">
                              {checkingUsername ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : usernameAvailable === true ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : usernameAvailable === false ? (
                                <XCircle className="h-4 w-4 text-destructive" />
                              ) : null}
                            </div>
                          )
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
                        onBlur={() =>
                          setTouched((t) => ({ ...t, email: true }))
                        }
                      />
                      <div className="space-y-3">
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
                        <PasswordStrength password={password} />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                        loading={submitting}
                        disabled={
                          submitting ||
                          username.trim().length < 3 ||
                          email.trim().length === 0 ||
                          password.length < 8 ||
                          usernameAvailable === false
                        }>
                        Sign Up
                      </Button>
                    </form>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[13px] text-muted-foreground font-medium">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="font-black text-primary hover:underline underline-offset-4 decoration-2"
                        onClick={() => navigate("/login")}
                        disabled={submitting}>
                        Sign in
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6">
                  <form className="space-y-6" onSubmit={handleVerifyCode}>
                    <SegmentedOTP
                      value={code}
                      onChange={setCode}
                      disabled={submitting}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      loading={submitting}
                      disabled={submitting || code.length < 6}>
                      Verify & Continue
                    </Button>
                  </form>

                  <div className="flex items-center justify-between px-2">
                    <button
                      type="button"
                      className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 hover:text-foreground transition-colors"
                      onClick={() => setStep("form")}
                      disabled={submitting}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="text-[10px] font-black uppercase tracking-[0.1em] text-primary hover:text-primary/80 transition-colors"
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
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}
