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
        {/* Animated Background Gradients */}
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}>
          {/* Top Right Glow */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
            }}
          />
          {/* Bottom Left Glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[150px]"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        <div className="flex w-full min-h-screen">
          {/* Left Panel: Infinite Carousel (Visible on Large Screens) */}
          <div className="hidden lg:flex lg:w-1/2 h-screen p-8 items-center justify-center">
            {/* The Rounded Container from the Image */}
            <div className="w-full h-full relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col items-center justify-center">
              
              {/* Vibrant Mesh Gradient Background Specific to Quad */}
              <div className="absolute inset-0 -z-10 bg-[#0d0d12]">
                {/* Moving Blobs for Mesh Effect - Vibrant Indigo/Violet/Cyan */}
                <motion.div 
                  animate={{ 
                    x: [0, 80, -40, 0],
                    y: [0, -60, 40, 0],
                    scale: [1, 1.4, 1.2, 1],
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-[10%] -left-[10%] w-full h-full rounded-full opacity-40 blur-[120px]"
                  style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
                />
                <motion.div 
                  animate={{ 
                    x: [0, -100, 60, 0],
                    y: [0, 80, -40, 0],
                    scale: [1.2, 1, 1.3, 1.2],
                  }}
                  transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-[-20%] -right-[10%] w-full h-full rounded-full opacity-30 blur-[130px]"
                  style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}
                />
                <motion.div 
                  animate={{ 
                    x: [0, 40, -60, 0],
                    y: [100, -20, 60, 100],
                    scale: [1, 1.2, 1.1, 1],
                  }}
                  transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-[30%] left-[20%] w-[80%] h-[80%] rounded-full opacity-20 blur-[100px]"
                  style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
                />
                
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              {/* Carousel Component Wrapper with Horizontal Padding */}
              <div className="w-full h-full relative z-10 px-12 xl:px-20 py-10">
                <LeftPanelCarousel />
              </div>

              {/* Glassy Overlay for edge fade */}
              <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_150px_rgba(0,0,0,0.2)]" />
            </div>
          </div>

          {/* Right Panel: Content (Login/Signup Form) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md mx-auto">
              <div className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-2xl backdrop-blur sm:p-8">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
