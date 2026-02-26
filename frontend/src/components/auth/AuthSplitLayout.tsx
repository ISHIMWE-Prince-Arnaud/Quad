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
    <div className="min-h-screen w-full bg-background lg:h-screen lg:overflow-hidden font-sans selection:bg-primary/20">
      <div className="relative min-h-screen w-full lg:h-full flex overflow-hidden">
        <div className="flex w-full min-h-screen">
          {/* Left Panel: Infinite Carousel (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:w-1/2 h-screen p-4 lg:p-6 lg:pr-3 items-center justify-center bg-muted/30">
            {/* The Container with surrounding ring */}
            <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center border border-border/60 rounded-2xl shadow-sm bg-card/50 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_55%),radial-gradient(900px_circle_at_80%_70%,hsl(var(--secondary)/0.06),transparent_60%)]" />
              {/* Carousel Component Wrapper with horizontal space inside container */}
              <div className="w-full h-full relative z-10 px-10 xl:px-16 py-4">
                <LeftPanelCarousel />
              </div>
            </div>
          </div>

          {/* Right Panel: Form (Connected directly to background with mesh effect) */}
          <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-8 lg:pl-3 overflow-hidden">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-pulse-subtle" />
              <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[100px] animate-pulse-subtle [animation-delay:1s]" />
              <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[80px] animate-pulse-subtle [animation-delay:2s]" />
              {/* Noise texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md mx-auto">
              <div className="w-full bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-primary/5">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
