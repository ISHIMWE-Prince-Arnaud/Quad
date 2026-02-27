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
    <div className="min-h-screen w-full bg-background lg:h-screen lg:overflow-hidden font-sans selection:bg-primary/20 relative">
      {/* Animated Mesh Background (Unified) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-pulse-subtle" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[100px] animate-pulse-subtle [animation-delay:1s]" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[80px] animate-pulse-subtle [animation-delay:2s]" />

        {/* Form grounding - Faint radial glow behind where the form sits */}
        <div className="absolute lg:right-[15%] right-1/2 lg:translate-x-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[100px] animate-pulse-subtle" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay [background-image:url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 min-h-screen w-full lg:h-full flex overflow-hidden">
        <div className="flex w-full min-h-screen">
          {/* Left Panel: Infinite Carousel (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:w-1/2 h-screen p-6 items-center justify-center">
            {/* The Container - Now transparent and borderless */}
            <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
              {/* Carousel Component Wrapper with horizontal space inside */}
              <div className="w-full h-full relative z-10 px-10 xl:px-16 py-4">
                <LeftPanelCarousel />
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 2.2,
                delay: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full max-w-md mx-auto">
              <div className="w-full p-2">{children}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
