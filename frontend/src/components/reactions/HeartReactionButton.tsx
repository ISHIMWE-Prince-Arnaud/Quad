import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function HeartReactionButton({
  liked,
  filled,
  count,
  pending,
  onToggle,
  className,
  iconClassName,
  countClassName,
  ariaLabel,
}: {
  liked: boolean;
  filled?: boolean;
  count?: number;
  pending?: boolean;
  onToggle: () => void | Promise<void>;
  className?: string;
  iconClassName?: string;
  countClassName?: string;
  ariaLabel?: string;
}) {
  const isFilled = liked || Boolean(filled);

  const baseIconClass = isFilled ? "text-[#f43f5e]" : "text-foreground";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={liked}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-xl transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}>
      <span className="relative inline-flex items-center justify-center">
        <motion.span
          key={liked ? "liked" : "unliked"}
          initial={{ scale: 1 }}
          animate={liked ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative inline-flex">
          <Heart
            className={cn("h-4 w-4", baseIconClass, iconClassName)}
            style={{ fill: isFilled ? "currentColor" : "none" }}
          />
        </motion.span>

        <AnimatePresence>
          {liked && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.8, 2.2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                boxShadow:
                  "0 0 0 2px rgba(244,63,94,0.55), 0 0 22px rgba(244,63,94,0.35)",
              }}
            />
          )}
        </AnimatePresence>
      </span>

      {typeof count === "number" && (
        <span className={cn("text-xs font-bold tabular-nums", countClassName)}>
          {count}
        </span>
      )}
    </button>
  );
}
