import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { LeftPanelCarousel } from "./LeftPanelCarousel";

type AuthVariant = "login" | "signup";

type AuthSplitLayoutProps = {
  variant: AuthVariant;
  children: ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background lg:h-screen lg:overflow-hidden font-sans">
      <div className="relative min-h-screen w-full lg:h-full flex overflow-hidden">
        <div className="flex w-full min-h-screen">
          {/* Left Panel: Infinite Carousel (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:w-1/2 h-screen p-4 lg:p-6 lg:pr-3 items-center justify-center">
            {/* The Container with surrounding ring */}
            <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center border-2 border-border/50 rounded-[32px]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
              <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(1200px_circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(900px_circle_at_80%_70%,hsl(var(--secondary)/0.12),transparent_60%)]" />
              {/* Carousel Component Wrapper with horizontal space inside container */}
              <div className="w-full h-full relative z-10 px-10 xl:px-16 py-4">
                <LeftPanelCarousel />
              </div>
            </div>
          </div>

          {/* Right Panel: Form (Connected directly to background) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-8 lg:pl-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto">
              <div className="w-full">{children}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
