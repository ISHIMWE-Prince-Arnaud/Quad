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
            {/* The Rounded Container - Connected feel with reduced radius */}
            <div className="w-full h-full relative rounded-sm overflow-hidden shadow-xl border border-border/40 flex flex-col items-center justify-center shadow-primary/5">
              {/* Mesh Gradient Background using Tokens */}
              <div className="absolute inset-0 -z-10 bg-card">
                {/* Moving Blobs for Mesh Effect using Quad Tokens */}
                <motion.div
                  animate={{
                    x: [0, 60, -30, 0],
                    y: [0, -40, 30, 0],
                    scale: [1, 1.3, 1.1, 1],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-[10%] -left-[10%] w-full h-full rounded-full opacity-40 blur-[100px]"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                  }}
                />
                <motion.div
                  animate={{
                    x: [0, -80, 50, 0],
                    y: [0, 60, -30, 0],
                    scale: [1.1, 1, 1.2, 1.1],
                  }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  className="absolute bottom-[-20%] -right-[10%] w-full h-full rounded-full opacity-30 blur-[120px]"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary) / 0.6) 0%, transparent 70%)",
                  }}
                />
                <motion.div
                  animate={{
                    x: [0, 30, -50, 0],
                    y: [80, -20, 50, 80],
                    scale: [1, 1.2, 1.1, 1],
                  }}
                  transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute top-[30%] left-[20%] w-[80%] h-[80%] rounded-full opacity-20 blur-[90px]"
                  style={{
                    background:
                      "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)",
                  }}
                />

                {/* Subtle Grainy Texture overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              {/* Carousel Component Wrapper with horizontal space inside container */}
              <div className="w-full h-full relative z-10 px-10 xl:px-16 py-10">
                <LeftPanelCarousel />
              </div>

              {/* Glassy Inner Edge Fade */}
              <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]" />
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
