import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
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

            {step === "form" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
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

                <form className="space-y-4" onSubmit={handleCreateAccount}>
                  <Input
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={submitting}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={submitting}
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={submitting}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    loading={submitting}
                    disabled={submitting}>
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
              </>
            )}

            {step === "verify" && (
              <>
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
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    loading={submitting}
                    disabled={submitting}>
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
              </>
            )}
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
