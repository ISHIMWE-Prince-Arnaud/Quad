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
            {/* The Rounded Container - Reduced from 3rem to approx 2.5rem */}
            <div className="w-full h-full relative rounded-sm overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center bg-[#0047FF]">
              {/* Vibrant Blue Gradient Background - Fixed hex colors for maximum visibility */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {/* High-intensity base layer */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #0047FF 0%, #001A66 100%)",
                  }}
                />

                {/* Ultra Glowing Primary Bloom */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] rounded-full opacity-70 blur-[100px]"
                  style={{
                    background:
                      "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
                  }}
                />

                {/* Shimmering highlight blob */}
                <motion.div
                  animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 right-0 w-full h-full rounded-full opacity-40 blur-[80px] bg-white"
                />

                {/* High-fidelity Grain overlay */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              {/* Carousel Component Wrapper - High Z-index to be above background */}
              <div className="w-full h-full relative z-10 px-10 xl:px-16 py-4">
                <LeftPanelCarousel />
              </div>

              {/* Glassy Inner Edge Fade */}
              <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_100px_rgba(255,255,255,0.05)]" />
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
