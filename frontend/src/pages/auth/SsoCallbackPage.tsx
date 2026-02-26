import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";

export default function SsoCallbackPage() {
  const [message, setMessage] = useState("Securing your session...");

  useEffect(() => {
    const messages = [
      "Securing your session...",
      "Syncing with the pulse...",
      "Preparing your workspace...",
      "Almost there...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setMessage(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthSplitLayout variant="login">
      <div className="flex flex-col items-center justify-center space-y-6 py-6 max-w-sm mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <LoadingSpinner size="lg" className="relative z-10" />
        </div>
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-lg font-black tracking-tight text-foreground">
            {message}
          </p>
          <p className="text-[13px] text-muted-foreground/60 font-medium">
            Redirecting you to Quad
          </p>
        </div>
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/app/feed"
          signUpForceRedirectUrl="/app/feed"
        />
      </div>
    </AuthSplitLayout>
  );
}
