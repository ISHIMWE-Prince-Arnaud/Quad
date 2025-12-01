import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-muted animate-pulse",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
          "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
          {
            "h-4 rounded": variant === "text",
            "rounded-full": variant === "circular",
            "rounded-lg": variant === "rectangular",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
