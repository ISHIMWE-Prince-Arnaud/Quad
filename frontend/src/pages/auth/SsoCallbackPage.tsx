import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import PulsingLogoSpinner from "@/components/ui/PulsingLogoSpinner";

export default function SsoCallbackPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6">
            <PulsingLogoSpinner />
          </div>
          <div className="text-lg font-semibold text-foreground">
            Finishing sign in…
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            You’ll be redirected automatically.
          </div>
        </div>
      </div>

      <AuthenticateWithRedirectCallback />
    </div>
  );
}
