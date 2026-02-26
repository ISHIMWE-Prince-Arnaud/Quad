import { AuthenticateWithRedirectCallback, useClerk } from "@clerk/clerk-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CallbackSkeleton } from "@/components/auth/AuthSkeletons";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SsoCallbackPage() {
  const { loaded: isLoaded } = useClerk();
  const [message, setMessage] = useState("Securing your session...");

  useEffect(() => {
    if (!isLoaded) return;
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
  }, [isLoaded]);

  return (
    <AuthSplitLayout variant="login">
      {!isLoaded ? (
        <CallbackSkeleton />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-10 py-8 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative">
            {/* Intense Glow Aura */}
            <div className="absolute inset-x-[-40px] inset-y-[-40px] bg-primary/[0.08] blur-[60px] rounded-full animate-pulse-subtle" />
            <div className="relative z-10 p-1 bg-background/40 backdrop-blur-md rounded-full border border-primary/10 shadow-2xl shadow-primary/5">
              <LoadingSpinner size="lg" className="text-primary" />
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-foreground">
                {message}
              </h2>
              <div className="flex flex-col items-center space-y-2">
                <p className="text-[14px] text-muted-foreground/50 font-medium tracking-wide">
                  Syncing your account with the{" "}
                  <span className="bg-gradient-to-r from-primary to-[#60a5fa] bg-clip-text text-transparent italic font-black pr-2">
                    Quad
                  </span>{" "}
                  pulse
                </p>

                {/* Animated Progress Bar Placeholder */}
                <div className="w-[180px] h-[3px] bg-muted/10 rounded-full overflow-hidden relative mt-2">
                  <motion.div
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden">
            <AuthenticateWithRedirectCallback
              signInForceRedirectUrl="/app/feed"
              signUpForceRedirectUrl="/app/feed"
            />
          </div>
        </div>
      )}
    </AuthSplitLayout>
  );
}
