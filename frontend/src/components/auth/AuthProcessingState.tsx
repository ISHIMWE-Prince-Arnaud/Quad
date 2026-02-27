import { motion } from "framer-motion";
import { LoadingSpinner } from "../ui/loading";
import { useEffect, useState } from "react";

interface AuthProcessingStateProps {
  message?: string;
  customMessages?: string[];
}

const defaultMessages = [
  "Securing your credentials...",
  "Syncing with the Quad...",
  "Preparing your college grid...",
  "Validating your identity...",
  "Almost ready to move...",
  "Calibrating the feed...",
  "Generating your neural identity...",
  "Constructing your timeline...",
  "Establishing secure handshake...",
  "Syncing with the pulse...",
];

export function AuthProcessingState({
  customMessages,
}: AuthProcessingStateProps) {
  const messages = customMessages || defaultMessages;
  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setCurrentMessage(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-12 w-full animate-in fade-in zoom-in-95 duration-500">
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
          key={currentMessage}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.5 }}
          className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-foreground min-h-[40px] px-4">
            {currentMessage}
          </h2>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-[13px] text-muted-foreground/50 font-medium tracking-wide">
              Syncing your account with{" "}
              <span className="bg-gradient-to-r from-primary to-[#60a5fa] bg-clip-text text-transparent italic font-black pr-2">
                Quad
              </span>
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
    </div>
  );
}
